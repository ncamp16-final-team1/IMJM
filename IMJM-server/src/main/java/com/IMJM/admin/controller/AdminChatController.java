package com.IMJM.admin.controller;

import com.IMJM.admin.dto.ChatMessageDto;
import com.IMJM.admin.repository.AdminChatRepository;
import com.IMJM.admin.repository.SalonPhotosRepository;
import com.IMJM.chat.repository.ChatRoomRepository;
import com.IMJM.chat.service.ChatService;
import com.IMJM.common.entity.ChatRoom;
import com.IMJM.common.entity.SalonPhotos;
import com.IMJM.user.dto.CustomOAuth2UserDto;
import com.IMJM.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
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
    private final ChatService chatService;
    private final UserRepository userRepository;

    @MessageMapping("/sendMessage")
    public void sendMessage(@Payload ChatMessageDto chatMessageDto) {
        adminChatRepository.sendMessage(chatMessageDto);
    }

    @GetMapping("/rooms")
    public ResponseEntity<List<Map<String, Object>>> getSalonChatRooms(@AuthenticationPrincipal CustomOAuth2UserDto userDetails) {
        String salonId = userDetails.getId();

        // 원래 서비스 호출
        List<com.IMJM.chat.dto.ChatRoomDto> chatRooms = chatService.getSalonChatRooms(salonId);

        // 응답 데이터 구성
        List<Map<String, Object>> result = new ArrayList<>();

        for (com.IMJM.chat.dto.ChatRoomDto room : chatRooms) {
            Map<String, Object> roomData = new HashMap<>();
            // 기존 데이터 복사
            roomData.put("id", room.getId());
            roomData.put("userId", room.getUserId());
            roomData.put("salonId", room.getSalonId());
            roomData.put("userName", room.getUserName());
            roomData.put("salonName", room.getSalonName());
            roomData.put("createdAt", room.getCreatedAt());
            roomData.put("lastMessageTime", room.getLastMessageTime());
            roomData.put("lastMessage", room.getLastMessage());
            roomData.put("hasUnreadMessages", room.isHasUnreadMessages());
            roomData.put("unreadCount", room.getUnreadCount());

            // 사용자 프로필 이미지 URL 추가
            try {
                com.IMJM.common.entity.Users user = userRepository.findById(room.getUserId()).orElse(null);
                if (user != null) {
                    roomData.put("userProfileUrl", user.getProfile());
                } else {
                    roomData.put("userProfileUrl", null);
                }
            } catch (Exception e) {
                // 에러 처리
                roomData.put("userProfileUrl", null);
            }

            result.add(roomData);
        }

        return ResponseEntity.ok(result);
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

        // 사용자 닉네임 또는 이름 추가
        String userName = chatRoom.getUser().getNickname();
        if (userName == null || userName.isEmpty()) {
            userName = chatRoom.getUser().getFirstName() + " " + chatRoom.getUser().getLastName();
        }
        roomInfo.put("userName", userName);

        // 사용자 프로필 이미지 추가
        roomInfo.put("userProfileUrl", chatRoom.getUser().getProfile());

        // 미용실 프로필 이미지 추가
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
}