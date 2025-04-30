package com.IMJM.chat.controller;

import com.IMJM.chat.dto.ChatMessageDto;
import com.IMJM.chat.dto.ChatRoomDto;
import com.IMJM.chat.service.ChatService;
import com.IMJM.common.entity.ChatRoom;
import com.IMJM.chat.repository.ChatRoomRepository;
import com.IMJM.user.dto.CustomOAuth2UserDto;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/chat")
public class ChatController {

    private final ChatService chatService;
    private final ChatRoomRepository chatRoomRepository;
    private final SimpMessagingTemplate messagingTemplate;

    // 메시지 전송 REST 엔드포인트
    @PostMapping("/message")
    public ResponseEntity<ChatMessageDto> sendMessage(@RequestBody ChatMessageDto chatMessageDto) {
        ChatMessageDto sentMessage = chatService.sendMessage(chatMessageDto);
        return ResponseEntity.ok(sentMessage);
    }

    // WebSocket 메시지 전송
    @MessageMapping("/chat.sendMessage")
    public void handleWebSocketMessage(@Payload ChatMessageDto chatMessageDto) {
        // 메시지 처리 및 저장
        ChatMessageDto processedMessage = chatService.sendMessage(chatMessageDto);

        // 발신자에게 메시지 전송 (본인 확인용)
        messagingTemplate.convertAndSendToUser(
                processedMessage.getSenderId(),
                "/queue/messages",
                processedMessage
        );

        // 수신자 결정
        String recipientId;
        if ("USER".equals(processedMessage.getSenderType())) {
            // 사용자가 보낸 메시지는 미용실로 전송
            recipientId = chatService.getSalonIdFromChatRoom(processedMessage.getChatRoomId());
        } else {
            // 미용실이 보낸 메시지는 사용자에게 전송
            recipientId = chatService.getUserIdFromChatRoom(processedMessage.getChatRoomId());
        }

        // 수신자에게 메시지 전송
        messagingTemplate.convertAndSendToUser(
                recipientId,
                "/queue/messages",
                processedMessage
        );

        // 특정 채팅방에 대한 토픽 구독자에게도 전송 (추가 안전장치)
        messagingTemplate.convertAndSend(
                "/topic/chat/" + processedMessage.getChatRoomId(),
                processedMessage
        );
    }

    // 채팅방 목록 조회 (사용자)
    @GetMapping("/rooms/user")
    public ResponseEntity<List<ChatRoomDto>> getUserChatRooms(@AuthenticationPrincipal CustomOAuth2UserDto userDetails) {
        String userId = userDetails.getId();
        return ResponseEntity.ok(chatService.getUserChatRooms(userId));
    }

    // 채팅방 목록 조회 (미용실)
    @GetMapping("/rooms/salon/{salonId}")
    public ResponseEntity<List<ChatRoomDto>> getSalonChatRooms(@PathVariable String salonId) {
        return ResponseEntity.ok(chatService.getSalonChatRooms(salonId));
    }

    // 채팅방 생성 또는 조회
    @PostMapping("/room")
    public ResponseEntity<ChatRoomDto> createChatRoom(@RequestParam String userId, @RequestParam String salonId) {
        return ResponseEntity.ok(chatService.getChatRoom(userId, salonId));
    }

    // 채팅방 메시지 목록 조회
    @GetMapping("/messages/{chatRoomId}")
    public ResponseEntity<List<ChatMessageDto>> getChatMessages(@PathVariable Long chatRoomId) {
        return ResponseEntity.ok(chatService.getChatMessages(chatRoomId));
    }

    // 메시지 읽음 처리
    @PutMapping("/messages/read/{chatRoomId}")
    public ResponseEntity<Map<String, Boolean>> markMessagesAsRead(
            @PathVariable Long chatRoomId,
            @RequestParam String senderType) {
        chatService.markMessagesAsRead(chatRoomId, senderType);
        Map<String, Boolean> response = new HashMap<>();
        response.put("success", true);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/messages/unread/count/{chatRoomId}")
    public ResponseEntity<Map<String, Integer>> getUnreadCount(
            @PathVariable Long chatRoomId,
            @RequestParam String senderType) {
        int count = chatService.countUnreadMessages(chatRoomId, senderType);
        Map<String, Integer> response = new HashMap<>();
        response.put("count", count);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/upload")
    public ResponseEntity<Map<String, String>> uploadChatImage(
            @RequestParam("file") MultipartFile file,
            @RequestParam("chatRoomId") Long chatRoomId) {

        String imageUrl = chatService.uploadChatImage(file, chatRoomId);

        return ResponseEntity.ok(Map.of("fileUrl", imageUrl));
    }

    // 다중 파일 업로드 엔드포인트
    @PostMapping("/upload/multiple")
    public ResponseEntity<List<Map<String, String>>> uploadMultipleImages(
            @RequestParam("files") List<MultipartFile> files,
            @RequestParam("chatRoomId") Long chatRoomId) {

        List<Map<String, String>> results = chatService.uploadMultipleChatImages(files, chatRoomId);

        return ResponseEntity.ok(results);
    }

    @GetMapping("/room/{roomId}")
    public ResponseEntity<Map<String, Object>> getChatRoomDetail(@PathVariable Long roomId) {
        ChatRoom chatRoom = chatRoomRepository.findById(roomId)
                .orElseThrow(() -> new RuntimeException("Chat room not found"));

        Map<String, Object> roomInfo = new HashMap<>();
        roomInfo.put("id", chatRoom.getId());
        roomInfo.put("userId", chatRoom.getUser().getId());
        roomInfo.put("salonId", chatRoom.getSalon().getId());
        roomInfo.put("salonName", chatRoom.getSalon().getName());
        roomInfo.put("userName", chatRoom.getUser().getNickname());
        roomInfo.put("userLanguage", chatRoom.getUser().getLanguage() != null ? chatRoom.getUser().getLanguage() : "en");
        roomInfo.put("salonLanguage", "ko"); // 미용실 언어는 한국어로 고정
        roomInfo.put("createdAt", chatRoom.getCreatedAt());
        roomInfo.put("lastMessageTime", chatRoom.getLastMessageTime());

        return ResponseEntity.ok(roomInfo);
    }

    // ChatController.java에 추가 또는 기존 코드 수정

    @GetMapping("/admin/room/{roomId}")
    public ResponseEntity<Map<String, Object>> getAdminChatRoomDetail(@PathVariable Long roomId) {
        ChatRoom chatRoom = chatRoomRepository.findById(roomId)
                .orElseThrow(() -> new RuntimeException("Chat room not found"));

        Map<String, Object> roomInfo = new HashMap<>();
        roomInfo.put("id", chatRoom.getId());
        roomInfo.put("userId", chatRoom.getUser().getId());
        roomInfo.put("salonId", chatRoom.getSalon().getId());
        roomInfo.put("salonName", chatRoom.getSalon().getName());

        // 사용자 닉네임 또는 이름 추가
        String userName = chatRoom.getUser().getNickname();
        if (userName == null || userName.isEmpty()) {
            userName = chatRoom.getUser().getFirstName() + " " + chatRoom.getUser().getLastName();
        }
        roomInfo.put("userName", userName);

        roomInfo.put("createdAt", chatRoom.getCreatedAt());
        roomInfo.put("lastMessageTime", chatRoom.getLastMessageTime());

        return ResponseEntity.ok(roomInfo);
    }

    @DeleteMapping("/room/{chatRoomId}")
    public ResponseEntity<?> deleteChatRoom(
            @PathVariable Long chatRoomId,
            @AuthenticationPrincipal CustomOAuth2UserDto userDetails
    ) {
        chatService.deleteChatRoom(chatRoomId);
        return ResponseEntity.ok().build();
    }
}