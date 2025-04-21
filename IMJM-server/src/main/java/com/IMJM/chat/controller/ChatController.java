package com.IMJM.chat.controller;

import com.IMJM.chat.dto.ChatMessageDto;
import com.IMJM.chat.dto.ChatRoomDto;
import com.IMJM.chat.service.ChatService;
import com.IMJM.user.dto.CustomOAuth2UserDto;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/chat")
public class ChatController {

    private final ChatService chatService;

    // 웹소켓으로 메시지 전송
    @MessageMapping("/chat.sendMessage")
    public void sendMessage(@Payload ChatMessageDto chatMessageDto) {
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
}
