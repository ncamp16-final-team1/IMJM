package com.IMJM.admin.service;

import com.IMJM.admin.dto.ChatMessageDto;
import com.IMJM.admin.dto.ChatPhotoDto;
import com.IMJM.admin.dto.ChatRoomDto;
import com.IMJM.admin.repository.*;
import com.IMJM.common.cloud.StorageService;
import com.IMJM.common.entity.*;
import com.IMJM.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminChatServiceImpl implements AdminChatRepository {

    private final AdminChatRoomRepository adminChatRoomRepository;
    private final AdminChatMessageRepository adminChatMessageRepository;
    private final AdminChatPhotosRepository adminChatPhotosRepository;
    private final SalonRepository salonRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final StorageService storageService;

    @Value("${ncp.bucket-name}")
    private String bucketName;

    @Override
    @Transactional
    public void sendMessage(ChatMessageDto messageDto) {
        // 채팅방 조회
        ChatRoom chatRoom = adminChatRoomRepository.findById(messageDto.getChatRoomId())
                .orElseThrow(() -> new RuntimeException("채팅방을 찾을 수 없습니다."));

        // 메시지 저장
        ChatMessage chatMessage = ChatMessage.builder()
                .chatRoom(chatRoom)
                .senderType(messageDto.getSenderType())
                .message(messageDto.getMessage())
                .isRead(false)
                .sentAt(LocalDateTime.now())
                .build();

        ChatMessage savedMessage = adminChatMessageRepository.save(chatMessage);

        // 사진 저장
        List<ChatPhotos> savedPhotos = savePhotos(savedMessage, messageDto.getPhotos());

        // 채팅방 마지막 메시지 시간 업데이트
        chatRoom.updateLastMessageTime(LocalDateTime.now());
        adminChatRoomRepository.save(chatRoom);

        // 메시지 DTO 변환
        ChatMessageDto responseDto = convertToMessageDto(savedMessage, savedPhotos);

        // 웹소켓으로 메시지 전송
        messagingTemplate.convertAndSendToUser(
                chatRoom.getUser().getId(),
                "/queue/messages",
                responseDto
        );
        messagingTemplate.convertAndSendToUser(
                chatRoom.getSalon().getId(),
                "/queue/messages",
                responseDto
        );
    }

    @Override
    @Transactional(readOnly = true)
    public List<ChatRoomDto> getSalonChatRooms(String salonId) {
        List<ChatRoom> chatRooms = adminChatRoomRepository.findBySalonIdOrderByLastMessageTimeDesc(salonId);

        return chatRooms.stream()
                .map(this::convertToChatRoomDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ChatMessageDto> getChatMessages(Long chatRoomId) {
        List<ChatMessage> messages = adminChatMessageRepository.findByChatRoomIdOrderBySentAtAsc(chatRoomId);

        return messages.stream()
                .map(message -> {
                    List<ChatPhotos> photos = adminChatPhotosRepository.findByChatMessageId(message.getId());
                    return convertToMessageDto(message, photos);
                })
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void markMessagesAsRead(Long chatRoomId) {
        adminChatMessageRepository.updateMessagesAsRead(chatRoomId);
    }

    private List<ChatPhotos> savePhotos(ChatMessage savedMessage, List<ChatPhotoDto> photoDtos) {
        if (photoDtos == null || photoDtos.isEmpty()) {
            return Collections.emptyList();
        }

        return photoDtos.stream()
                .map(photoDto -> {
                    ChatPhotos photo = ChatPhotos.builder()
                            .chatMessage(savedMessage)
                            .photoUrl(photoDto.getPhotoUrl())
                            .uploadDate(LocalDateTime.now())
                            .build();
                    return adminChatPhotosRepository.save(photo);
                })
                .collect(Collectors.toList());
    }

    private ChatRoomDto convertToChatRoomDto(ChatRoom chatRoom) {
        Optional<ChatMessage> lastMessage = adminChatMessageRepository
                .findTopByChatRoomIdOrderBySentAtDesc(chatRoom.getId());

        int unreadCount = adminChatMessageRepository.countByReadFalseAndSenderType(
                chatRoom.getId(), "USER"
        );

        return ChatRoomDto.builder()
                .id(chatRoom.getId())
                .userId(chatRoom.getUser().getId())
                .salonId(chatRoom.getSalon().getId())
                .salonName(chatRoom.getSalon().getName())
                .userName(chatRoom.getUser().getNickname())
                .createdAt(chatRoom.getCreatedAt())
                .lastMessageTime(chatRoom.getLastMessageTime())
                .lastMessage(lastMessage.map(ChatMessage::getMessage).orElse(null))
                .unreadCount(unreadCount)
                .build();
    }

    private ChatMessageDto convertToMessageDto(ChatMessage message, List<ChatPhotos> photos) {
        List<ChatPhotoDto> photoDtos = photos.stream()
                .map(photo -> ChatPhotoDto.builder()
                        .photoId(photo.getPhotoId())
                        .photoUrl(photo.getPhotoUrl())
                        .build())
                .collect(Collectors.toList());

        return ChatMessageDto.builder()
                .id(message.getId())
                .chatRoomId(message.getChatRoom().getId())
                .senderType(message.getSenderType())
                .senderId(message.getChatRoom().getUser().getId())
                .message(message.getMessage())
                .isRead(message.getIsRead())
                .sentAt(message.getSentAt())
                .photos(photoDtos)
                .build();
    }

    @Override
    public String uploadChatImage(MultipartFile file, Long chatRoomId) {
        try {
            String originalFilename = file.getOriginalFilename();
            String ext = Objects.requireNonNull(originalFilename).substring(originalFilename.lastIndexOf("."));
            String uuid = UUID.randomUUID().toString();
            String fileName = uuid + ext;

            String s3Path = "admin/chat/" + chatRoomId + "/" + fileName;

            storageService.upload(s3Path, file.getInputStream());

            return "https://" + bucketName + ".kr.object.ncloudstorage.com/" + s3Path;
        } catch (IOException e) {
            throw new RuntimeException("파일 업로드 실패", e);
        }
    }
}