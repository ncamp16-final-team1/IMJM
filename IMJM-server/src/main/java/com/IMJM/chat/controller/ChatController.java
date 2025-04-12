package com.IMJM.chat.controller;

import com.IMJM.chat.dto.ChatMessageDto;
import com.IMJM.chat.dto.ChatRoomDto;
import com.IMJM.chat.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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
    @GetMapping("/rooms/user/{userId}")
    public ResponseEntity<List<ChatRoomDto>> getUserChatRooms(@PathVariable String userId) {
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
    @PutMapping("/messages/read")
    public ResponseEntity<Void> markMessagesAsRead(@RequestParam Long chatRoomId, @RequestParam String senderType) {
        chatService.markMessagesAsRead(chatRoomId, senderType);
        return ResponseEntity.ok().build();
    }
}
