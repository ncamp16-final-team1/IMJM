// IMJM-server/src/main/java/com/IMJM/chat/controller/ChatController.java 수정
package com.IMJM.chat.controller;

import com.IMJM.chat.dto.ChatMessageDto;
import com.IMJM.chat.dto.ChatRoomDto;
import com.IMJM.chat.service.RabbitMQChatService;
import com.IMJM.common.cloud.StorageService;
import com.IMJM.user.dto.CustomOAuth2UserDto;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/chat")
public class ChatController {

    private final RabbitMQChatService chatService;

    // 메시지 전송 REST 엔드포인트 (RabbitMQ 사용)
    @PostMapping("/message")
    public ResponseEntity<ChatMessageDto> sendMessage(@RequestBody ChatMessageDto chatMessageDto) {
        ChatMessageDto sentMessage = chatService.sendMessage(chatMessageDto);
        return ResponseEntity.ok(sentMessage);
    }

    // WebSocket 메시지 전송 (레거시 지원)
    @MessageMapping("/chat.sendMessage")
    public void handleWebSocketMessage(@Payload ChatMessageDto chatMessageDto) {
        chatService.sendMessage(chatMessageDto);
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
}