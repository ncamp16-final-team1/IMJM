// IMJM-server/src/main/java/com/IMJM/chat/service/RabbitMQChatService.java
package com.IMJM.chat.service;

import com.IMJM.chat.dto.ChatMessageDto;
import com.IMJM.chat.dto.ChatPhotoDto;
import com.IMJM.chat.dto.ChatRoomDto;
import com.IMJM.chat.exception.TranslationException;
import com.IMJM.chat.repository.*;
import com.IMJM.common.cloud.StorageService;
import com.IMJM.common.entity.*;
import com.IMJM.config.RabbitMQConfig;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.core.AmqpAdmin;
import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class RabbitMQChatService {

    private final ChatRoomRepository chatRoomRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final ChatPhotosRepository chatPhotosRepository;
    private final ChatUserRepository chatUserRepository;
    private final ChatSalonRepository chatSalonRepository;
    private final TranslationService translationService;
    private final StorageService storageService;
    private final RabbitTemplate rabbitTemplate;
    private final AmqpAdmin amqpAdmin;

    @Value("${ncp.bucket-name}")
    private String bucketName;

    // 사용자별 큐 생성 메서드
    private void ensureQueueExists(String userId) {
        String queueName = RabbitMQConfig.QUEUE_PREFIX + userId;
        String routingKey = RabbitMQConfig.ROUTING_KEY_PREFIX + userId;

        // 큐가 없으면 생성
        Queue queue = new Queue(queueName, true);
        amqpAdmin.declareQueue(queue);

        // 큐와 교환기를 바인딩
        Binding binding = new Binding(queueName,
                Binding.DestinationType.QUEUE,
                RabbitMQConfig.EXCHANGE_NAME,
                routingKey,
                null);
        amqpAdmin.declareBinding(binding);
    }

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

                    // 사용자와 미용실 큐 생성 보장
                    ensureQueueExists(userId);
                    ensureQueueExists(salonId);

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

    // 메시지 저장 및 전송
    @Transactional
    public ChatMessageDto sendMessage(ChatMessageDto messageDto) {
        // 채팅방 조회
        ChatRoom chatRoom = findChatRoomById(messageDto.getChatRoomId());

        // 번역 처리
        TranslationResult translationResult = translateMessageIfNeeded(messageDto.getMessage(), chatRoom, messageDto.getSenderType());

        // 메시지 저장
        ChatMessage savedMessage = saveNewMessage(chatRoom, messageDto, translationResult);

        // 채팅방 마지막 메시지 시간 업데이트
        chatRoom.updateLastMessageTime(LocalDateTime.now());
        chatRoomRepository.save(chatRoom);

        // 사진 처리 및 응답 DTO 생성
        ChatMessageDto responseDto = createResponseDto(savedMessage, messageDto.getSenderId(),
                processChatPhotos(savedMessage, messageDto.getPhotos()));

        // RabbitMQ로 메시지 전송
        String userRoutingKey = RabbitMQConfig.ROUTING_KEY_PREFIX + chatRoom.getUser().getId();
        String salonRoutingKey = RabbitMQConfig.ROUTING_KEY_PREFIX + chatRoom.getSalon().getId();

        // 사용자와 미용실 모두에게 메시지 전송
        rabbitTemplate.convertAndSend(RabbitMQConfig.EXCHANGE_NAME, userRoutingKey, responseDto);
        rabbitTemplate.convertAndSend(RabbitMQConfig.EXCHANGE_NAME, salonRoutingKey, responseDto);

        return responseDto;
    }

    private ChatRoom findChatRoomById(Long chatRoomId) {
        return chatRoomRepository.findById(chatRoomId)
                .orElseThrow(() -> new RuntimeException("Chat room not found"));
    }

    private static class TranslationResult {
        final String translatedMessage;
        final String translationStatus;

        TranslationResult(String translatedMessage, String translationStatus) {
            this.translatedMessage = translatedMessage;
            this.translationStatus = translationStatus;
        }
    }

    private TranslationResult translateMessageIfNeeded(String message, ChatRoom chatRoom, String senderType) {
        String senderLanguage = getSenderLanguage(senderType, chatRoom);
        String recipientLanguage = getRecipientLanguage(senderType, chatRoom);

        // 언어가 같으면 번역하지 않음
        if (senderLanguage.equals(recipientLanguage)) {
            return new TranslationResult(null, "none");
        }

        try {
            String translatedMessage = translationService.translate(
                    message,
                    senderLanguage,
                    recipientLanguage
            );
            return new TranslationResult(translatedMessage, "completed");
        } catch (TranslationException e) {
            return new TranslationResult(null, "failed");
        }
    }

    private ChatMessage saveNewMessage(ChatRoom chatRoom, ChatMessageDto messageDto, TranslationResult translationResult) {
        ChatMessage chatMessage = ChatMessage.builder()
                .chatRoom(chatRoom)
                .senderType(messageDto.getSenderType())
                .message(messageDto.getMessage())
                .isRead(false)
                .sentAt(LocalDateTime.now())
                .translatedMessage(translationResult.translatedMessage)
                .translationStatus(translationResult.translationStatus)
                .build();

        return chatMessageRepository.save(chatMessage);
    }

    private List<ChatPhotoDto> processChatPhotos(ChatMessage savedMessage, List<ChatPhotoDto> photoDtos) {
        if (photoDtos == null || photoDtos.isEmpty()) {
            return new ArrayList<>();
        }

        return photoDtos.stream()
                .map(photoDto -> {
                    ChatPhotos photo = ChatPhotos.builder()
                            .chatMessage(savedMessage)
                            .photoUrl(photoDto.getPhotoUrl())
                            .uploadDate(LocalDateTime.now())
                            .build();

                    ChatPhotos savedPhoto = chatPhotosRepository.save(photo);
                    return ChatPhotoDto.builder()
                            .photoId(savedPhoto.getPhotoId())
                            .photoUrl(savedPhoto.getPhotoUrl())
                            .build();
                })
                .collect(Collectors.toList());
    }

    private ChatMessageDto createResponseDto(ChatMessage message, String senderId, List<ChatPhotoDto> photos) {
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

    // 채팅방 메시지 목록 조회
    @Transactional(readOnly = true)
    public List<ChatMessageDto> getChatMessages(Long chatRoomId) {
        // 채팅방의 모든 메시지를 한 번에 조회 (채팅방 정보 포함)
        List<ChatMessage> messages = chatMessageRepository.findByChatRoomIdWithChatRoomOrderBySentAtAsc(chatRoomId);

        if (messages.isEmpty()) {
            return Collections.emptyList();
        }

        // 모든 메시지 ID 추출
        List<Long> messageIds = messages.stream()
                .map(ChatMessage::getId)
                .collect(Collectors.toList());

        // 모든 사진 정보를 한 번에 조회
        List<ChatPhotos> allPhotos = chatPhotosRepository.findByChatMessageIdIn(messageIds);

        // 메시지 ID를 키로 하는 사진 맵 생성
        Map<Long, List<ChatPhotos>> photosByMessageId = allPhotos.stream()
                .collect(Collectors.groupingBy(photo -> photo.getChatMessage().getId()));

        // 각 메시지에 대한 DTO 생성 (사진 정보 포함)
        return messages.stream()
                .map(message -> {
                    // 현재 메시지에 연결된 사진 목록
                    List<ChatPhotos> photos = photosByMessageId.getOrDefault(message.getId(), Collections.emptyList());

                    // 사진 DTO 변환
                    List<ChatPhotoDto> photoDtos = photos.stream()
                            .map(photo -> ChatPhotoDto.builder()
                                    .photoId(photo.getPhotoId())
                                    .photoUrl(photo.getPhotoUrl())
                                    .build())
                            .collect(Collectors.toList());

                    // sender ID 설정
                    String senderId;
                    if ("USER".equals(message.getSenderType())) {
                        senderId = message.getChatRoom().getUser().getId();
                    } else {
                        senderId = message.getChatRoom().getSalon().getId();
                    }

                    // 메시지 DTO 생성 및 반환
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
                            .photos(photoDtos)
                            .build();
                })
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
        String oppositeType = "USER".equals(senderType) ? "SALON" : "USER";
        return chatMessageRepository.countByReadFalseAndSenderType(chatRoomId, oppositeType);
    }

    private ChatRoomDto convertToChatRoomDto(ChatRoom chatRoom, String userType) {
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

    private String getSenderLanguage(String senderType, ChatRoom chatRoom) {
        if ("USER".equals(senderType)) {
            // 사용자가 발신자인 경우 사용자의 언어 반환
            String userLanguage = chatRoom.getUser().getLanguage();
            return userLanguage != null ? userLanguage : "ko";
        } else {
            // 미용실이 발신자인 경우 한국어로 가정
            return "ko";
        }
    }

    private String getRecipientLanguage(String senderType, ChatRoom chatRoom) {
        if ("USER".equals(senderType)) {
            // 사용자가 발신자인 경우 수신자는 미용실이므로 한국어
            return "ko";
        } else {
            // 미용실이 발신자인 경우 수신자는 사용자이므로 사용자 언어 반환
            String userLanguage = chatRoom.getUser().getLanguage();
            return userLanguage != null ? userLanguage : "ko";
        }
    }

    // 이미지 업로드 기능
    public String uploadChatImage(MultipartFile file, Long chatRoomId) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("파일이 비어있습니다.");
        }

        try {
            String originalFilename = file.getOriginalFilename();
            String ext = Objects.requireNonNull(originalFilename).substring(originalFilename.lastIndexOf("."));
            String uuid = UUID.randomUUID().toString();
            String fileName = uuid + ext;

            // chat/{chatRoomId}/{timestamp}_{uuid}.ext 형식의 경로
            String s3Path = "chat/" + chatRoomId + "/" + System.currentTimeMillis() + "_" + fileName;

            storageService.upload(s3Path, file.getInputStream());

            return "https://" + bucketName + ".kr.object.ncloudstorage.com/" + s3Path;
        } catch (IOException e) {
            throw new RuntimeException("파일 업로드 실패", e);
        }
    }

    public List<Map<String, String>> uploadMultipleChatImages(List<MultipartFile> files, Long chatRoomId) {
        return files.stream()
                .map(file -> {
                    String fileUrl = uploadChatImage(file, chatRoomId);
                    return Map.of(
                            "fileUrl", fileUrl,
                            "fileName", file.getOriginalFilename(),
                            "fileSize", String.valueOf(file.getSize())
                    );
                })
                .collect(Collectors.toList());
    }
}