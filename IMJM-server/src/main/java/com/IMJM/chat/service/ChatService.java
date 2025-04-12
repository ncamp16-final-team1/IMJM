package com.IMJM.chat.service;

import com.IMJM.chat.dto.ChatMessageDto;
import com.IMJM.chat.dto.ChatPhotoDto;
import com.IMJM.chat.dto.ChatRoomDto;
import com.IMJM.chat.repository.*;
import com.IMJM.common.entity.*;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final ChatRoomRepository chatRoomRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final ChatPhotosRepository chatPhotosRepository;
    private final SimpMessagingTemplate messagingTemplate;

    private final ChatUserRepository chatUserRepository;
    private final ChatSalonRepository chatSalonRepository;

    // 채팅방 생성 또는 조회
    @Transactional
    public ChatRoomDto getChatRoom(String userId, String salonId) {
        // 채팅방이 있는지 확인, 없으면 생성
        ChatRoom chatRoom = chatRoomRepository.findByUserIdAndSalonId(userId, salonId)
                .orElseGet(() -> {
                    // 실제 유저와 샵 엔티티 조회
                    Users user = chatUserRepository.findById(userId)
                            .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

                    Salon salon = chatSalonRepository.findById(salonId)
                            .orElseThrow(() -> new RuntimeException("Salon not found with id: " + salonId));

                    return chatRoomRepository.save(
                            ChatRoom.builder()
                                    .user(user)
                                    .salon(salon)
                                    .createdAt(LocalDateTime.now())
                                    .lastMessageTime(LocalDateTime.now())
                                    .build()
                    );
                });

        // 조회한 사용자가 USER인지 SALON인지에 따라 적절한 타입 전달
        String userType = userId.equals(chatRoom.getUser().getId()) ? "USER" : "SALON";
        return convertToChatRoomDto(chatRoom, userType);
    }

    // 채팅방 목록 조회 (사용자용)
    @Transactional(readOnly = true)
    public List<ChatRoomDto> getUserChatRooms(String userId) {
        return chatRoomRepository.findByUserIdOrderByLastMessageTimeDesc(userId).stream()
                .map(chatRoom -> convertToChatRoomDto(chatRoom, "USER"))
                .collect(Collectors.toList());
    }

    // 채팅방 목록 조회 (미용실용)
    @Transactional(readOnly = true)
    public List<ChatRoomDto> getSalonChatRooms(String salonId) {
        return chatRoomRepository.findBySalonIdOrderByLastMessageTimeDesc(salonId).stream()
                .map(chatRoom -> convertToChatRoomDto(chatRoom, "SALON"))
                .collect(Collectors.toList());
    }

    // 메시지 저장 및 전송
    @Transactional
    public ChatMessageDto sendMessage(ChatMessageDto messageDto) {
        // 채팅방 조회
        ChatRoom chatRoom = chatRoomRepository.findById(messageDto.getChatRoomId())
                .orElseThrow(() -> new RuntimeException("Chat room not found"));

        // 메시지 저장
        ChatMessage chatMessage = ChatMessage.builder()
                .chatRoom(chatRoom)
                .senderType(messageDto.getSenderType())
                .message(messageDto.getMessage())
                .isRead(false)
                .sentAt(LocalDateTime.now())
                .translationStatus("none")
                .build();

        ChatMessage savedMessage = chatMessageRepository.save(chatMessage);

        // 채팅방 마지막 메시지 시간 업데이트 (새 객체 생성)
        ChatRoom updatedChatRoom = ChatRoom.builder()
                .id(chatRoom.getId())
                .user(chatRoom.getUser())
                .salon(chatRoom.getSalon())
                .createdAt(chatRoom.getCreatedAt())
                .lastMessageTime(LocalDateTime.now())
                .build();

        chatRoomRepository.save(updatedChatRoom);

        // 사진이 있는 경우 처리
        List<ChatPhotoDto> savedPhotos = new ArrayList<>();
        if (messageDto.getPhotos() != null && !messageDto.getPhotos().isEmpty()) {
            for (ChatPhotoDto photoDto : messageDto.getPhotos()) {
                ChatPhotos photo = ChatPhotos.builder()
                        .chatMessage(savedMessage)
                        .photoUrl(photoDto.getPhotoUrl())
                        .uploadDate(LocalDateTime.now())
                        .build();

                ChatPhotos savedPhoto = chatPhotosRepository.save(photo);
                savedPhotos.add(ChatPhotoDto.builder()
                        .photoId(savedPhoto.getPhotoId())
                        .photoUrl(savedPhoto.getPhotoUrl())
                        .build());
            }
        }

        // 응답 DTO 생성
        ChatMessageDto responseDto = ChatMessageDto.builder()
                .id(savedMessage.getId())
                .chatRoomId(chatRoom.getId())
                .senderType(savedMessage.getSenderType())
                .senderId(messageDto.getSenderId())
                .message(savedMessage.getMessage())
                .isRead(savedMessage.getIsRead())
                .sentAt(savedMessage.getSentAt())
                .translatedMessage(savedMessage.getTranslatedMessage())
                .translationStatus(savedMessage.getTranslationStatus())
                .photos(savedPhotos)
                .build();

        // 웹소켓으로 메시지 전송
        // 사용자에게 전송
        messagingTemplate.convertAndSendToUser(
                chatRoom.getUser().getId(),
                "/queue/messages",
                responseDto
        );

        // 미용실에게 전송
        messagingTemplate.convertAndSendToUser(
                chatRoom.getSalon().getId(),
                "/queue/messages",
                responseDto
        );

        return responseDto;
    }

    // 메시지 목록 조회
    @Transactional(readOnly = true)
    public List<ChatMessageDto> getChatMessages(Long chatRoomId) {
        List<ChatMessage> messages = chatMessageRepository.findByChatRoomIdOrderBySentAtAsc(chatRoomId);
        return messages.stream()
                .map(this::convertToChatMessageDto)
                .collect(Collectors.toList());
    }

    // 메시지를 읽음으로 표시
    @Transactional
    public void markMessagesAsRead(Long chatRoomId, String senderType) {
        // 상대방이 보낸 메시지만 읽음 처리
        String oppositeType = "USER".equals(senderType) ? "SALON" : "USER";
        chatMessageRepository.updateMessagesAsRead(chatRoomId, oppositeType);
    }

    // 읽지 않은 메시지 수 카운트
    @Transactional(readOnly = true)
    public int countUnreadMessages(Long chatRoomId, String senderType) {
        // 내가 받은 메시지만 카운트 (내가 USER면 SALON이 보낸 메시지, 내가 SALON이면 USER가 보낸 메시지)
        String oppositeType = "USER".equals(senderType) ? "SALON" : "USER";
        return chatMessageRepository.countByReadFalseAndSenderType(chatRoomId, oppositeType);
    }

    // 엔티티를 DTO로 변환하는 메서드들
    private ChatRoomDto convertToChatRoomDto(ChatRoom chatRoom, String userType) {
        // 마지막 메시지 찾기
        ChatMessage lastMessage = chatMessageRepository
                .findTopByChatRoomIdOrderBySentAtDesc(chatRoom.getId())
                .orElse(null);

        String lastMessageContent = "";
        boolean hasUnreadMessages = false;
        int unreadCount = 0;

        if (lastMessage != null) {
            lastMessageContent = lastMessage.getMessage();

            // 현재 사용자가 받은 메시지 중 읽지 않은 것만 카운트
            String oppositeType = "USER".equals(userType) ? "SALON" : "USER";

            unreadCount = chatMessageRepository.countByReadFalseAndSenderType(
                    chatRoom.getId(), oppositeType);

            hasUnreadMessages = unreadCount > 0;
        }

        return ChatRoomDto.builder()
                .id(chatRoom.getId())
                .userId(chatRoom.getUser().getId())
                .salonId(chatRoom.getSalon().getId())
                .salonName(chatRoom.getSalon().getName())
                .userName(chatRoom.getUser().getNickname())
                .createdAt(chatRoom.getCreatedAt())
                .lastMessageTime(chatRoom.getLastMessageTime())
                .lastMessage(lastMessageContent)
                .hasUnreadMessages(hasUnreadMessages)
                .unreadCount(unreadCount)
                .build();
    }

    private ChatMessageDto convertToChatMessageDto(ChatMessage message) {
        // 사진 정보 로드
        List<ChatPhotoDto> photos = chatPhotosRepository.findByChatMessageId(message.getId()).stream()
                .map(photo -> ChatPhotoDto.builder()
                        .photoId(photo.getPhotoId())
                        .photoUrl(photo.getPhotoUrl())
                        .build())
                .collect(Collectors.toList());

        // sender ID 추가 (USER인 경우 user ID, SALON인 경우 salon ID)
        String senderId;
        if ("USER".equals(message.getSenderType())) {
            senderId = message.getChatRoom().getUser().getId();
        } else {
            senderId = message.getChatRoom().getSalon().getId();
        }

        return ChatMessageDto.builder()
                .id(message.getId())
                .chatRoomId(message.getChatRoom().getId())
                .senderType(message.getSenderType())
                .senderId(senderId)
                .message(message.getMessage())
                .isRead(message.getIsRead())
                .sentAt(message.getSentAt())
                .translatedMessage(message.getTranslatedMessage())
                .translationStatus(message.getTranslationStatus())
                .photos(photos)
                .build();
    }
}
