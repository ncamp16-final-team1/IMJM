package com.IMJM.admin.controller;

import com.IMJM.admin.dto.ChatMessageDto;
import com.IMJM.admin.dto.ChatRoomDto;
import com.IMJM.admin.dto.CustomSalonDetails;
import com.IMJM.admin.repository.AdminChatRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/chat")
public class AdminChatController {

    private final AdminChatRepository chatService;

    @MessageMapping("/sendMessage")
    public void sendMessage(@Payload ChatMessageDto chatMessageDto) {
        chatService.sendMessage(chatMessageDto);
    }

    @GetMapping("/rooms")
    public ResponseEntity<List<ChatRoomDto>> getSalonChatRooms(
            @AuthenticationPrincipal CustomSalonDetails salonDetails) {
        return ResponseEntity.ok(chatService.getSalonChatRooms(salonDetails.getSalon().getId()));
    }

    @GetMapping("/messages/{chatRoomId}")
    public ResponseEntity<List<ChatMessageDto>> getChatMessages(
            @PathVariable Long chatRoomId) {
        return ResponseEntity.ok(chatService.getChatMessages(chatRoomId));
    }

    @PutMapping("/messages/read/{chatRoomId}")
    public ResponseEntity<Map<String, Boolean>> markMessagesAsRead(
            @PathVariable Long chatRoomId) {
        chatService.markMessagesAsRead(chatRoomId);
        return ResponseEntity.ok(Map.of("success", true));
    }

    @PostMapping("/upload")
    public ResponseEntity<Map<String, String>> uploadChatImage(
            @RequestParam("file") MultipartFile file,
            @RequestParam("chatRoomId") Long chatRoomId) {
        String imageUrl = chatService.uploadChatImage(file, chatRoomId);
        return ResponseEntity.ok(Map.of("fileUrl", imageUrl));
    }
}