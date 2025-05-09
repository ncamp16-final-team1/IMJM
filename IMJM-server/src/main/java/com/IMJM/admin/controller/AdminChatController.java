package com.IMJM.admin.controller;

import com.IMJM.admin.dto.ChatMessageDto;
import com.IMJM.admin.dto.ChatRoomDto;
import com.IMJM.admin.dto.CustomSalonDetails;
import com.IMJM.admin.repository.AdminChatRepository;
import com.IMJM.admin.repository.SalonPhotosRepository;
import com.IMJM.chat.repository.ChatRoomRepository;
import com.IMJM.common.entity.ChatRoom;
import com.IMJM.common.entity.SalonPhotos;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.DestinationVariable;
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
@RequestMapping("/api/admin/chat")
public class AdminChatController {

    private final AdminChatRepository adminChatRepository;
    private final ChatRoomRepository chatRoomRepository;
    private final SalonPhotosRepository salonPhotosRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/sendMessage")
    public void sendMessage(@Payload ChatMessageDto chatMessageDto) {
        adminChatRepository.sendMessage(chatMessageDto);
    }

    @GetMapping("/rooms")
    public ResponseEntity<List<ChatRoomDto>> getSalonChatRooms(
            @AuthenticationPrincipal CustomSalonDetails salonDetails) {
        return ResponseEntity.ok(adminChatRepository.getSalonChatRooms(salonDetails.getSalon().getId()));
    }

    @MessageMapping("/chat/message-read/{roomId}")
    public void handleMessageRead(@DestinationVariable Long roomId) {
        adminChatRepository.markMessagesAsRead(roomId);

        ChatRoom chatRoom = chatRoomRepository.findById(roomId)
                .orElseThrow(() -> new RuntimeException("Chat room not found"));

        messagingTemplate.convertAndSendToUser(
                chatRoom.getUser().getId(),
                "/queue/message-read",
                roomId
        );
        messagingTemplate.convertAndSendToUser(
                chatRoom.getSalon().getId(),
                "/queue/message-read",
                roomId
        );
    }

    @GetMapping("/room/{roomId}")
    public ResponseEntity<Map<String, Object>> getAdminChatRoomDetail(@PathVariable Long roomId) {
        ChatRoom chatRoom = chatRoomRepository.findById(roomId)
                .orElseThrow(() -> new RuntimeException("Chat room not found"));

        Map<String, Object> roomInfo = new HashMap<>();
        roomInfo.put("id", chatRoom.getId());
        roomInfo.put("userId", chatRoom.getUser().getId());
        roomInfo.put("salonId", chatRoom.getSalon().getId());
        roomInfo.put("salonName", chatRoom.getSalon().getName());

        String userName = chatRoom.getUser().getNickname();
        if (userName == null || userName.isEmpty()) {
            userName = chatRoom.getUser().getFirstName() + " " + chatRoom.getUser().getLastName();
        }
        roomInfo.put("userName", userName);

        roomInfo.put("userProfileUrl", chatRoom.getUser().getProfile());

        List<SalonPhotos> salonPhotos = salonPhotosRepository.findBySalon_IdOrderByPhotoOrderAsc(chatRoom.getSalon().getId());
        String salonProfileUrl = !salonPhotos.isEmpty() ? salonPhotos.get(0).getPhotoUrl() : null;
        roomInfo.put("salonProfileUrl", salonProfileUrl);

        roomInfo.put("createdAt", chatRoom.getCreatedAt());
        roomInfo.put("lastMessageTime", chatRoom.getLastMessageTime());

        return ResponseEntity.ok(roomInfo);
    }

    @GetMapping("/messages/{chatRoomId}")
    public ResponseEntity<List<ChatMessageDto>> getChatMessages(
            @PathVariable Long chatRoomId) {
        return ResponseEntity.ok(adminChatRepository.getChatMessages(chatRoomId));
    }

    @PutMapping("/messages/read/{chatRoomId}")
    public ResponseEntity<Map<String, Boolean>> markMessagesAsRead(
            @PathVariable Long chatRoomId) {
        adminChatRepository.markMessagesAsRead(chatRoomId);
        return ResponseEntity.ok(Map.of("success", true));
    }

    @PostMapping("/upload")
    public ResponseEntity<Map<String, String>> uploadChatImage(
            @RequestParam("file") MultipartFile file,
            @RequestParam("chatRoomId") Long chatRoomId) {
        String imageUrl = adminChatRepository.uploadChatImage(file, chatRoomId);
        return ResponseEntity.ok(Map.of("fileUrl", imageUrl));
    }

    @DeleteMapping("/room/{roomId}")
    public ResponseEntity<?> deleteChatRoom(@PathVariable Long roomId) {
        try {
            // chatRoomRepository를 사용하여 채팅방 찾기
            ChatRoom chatRoom = chatRoomRepository.findById(roomId)
                    .orElseThrow(() -> new RuntimeException("채팅방을 찾을 수 없습니다."));

            // 채팅방과 관련된 메시지 삭제 (선택적)
            // adminChatMessageRepository.deleteByChatRoomId(roomId);

            // 채팅방 삭제
            chatRoomRepository.deleteById(roomId);

            return ResponseEntity.ok().body(Map.of("success", true, "message", "채팅방이 성공적으로 삭제되었습니다."));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", "채팅방 삭제 실패: " + e.getMessage()));
        }
    }
}