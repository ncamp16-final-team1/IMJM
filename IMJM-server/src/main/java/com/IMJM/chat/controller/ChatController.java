package com.IMJM.chat.controller;

import com.IMJM.admin.repository.BlacklistRepository;
import com.IMJM.admin.repository.SalonPhotosRepository;
import com.IMJM.chat.dto.ChatMessageDto;
import com.IMJM.chat.dto.ChatRoomDto;
import com.IMJM.chat.exception.ChatRoomNotFountException;
import com.IMJM.chat.repository.ChatRoomRepository;
import com.IMJM.chat.service.ChatService;
import com.IMJM.common.entity.ChatRoom;
import com.IMJM.common.entity.SalonPhotos;
import com.IMJM.user.dto.CustomOAuth2UserDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
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

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/chat")
public class ChatController {

    private final ChatService chatService;
    private final ChatRoomRepository chatRoomRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final BlacklistRepository blacklistRepository;
    private final SalonPhotosRepository salonPhotosRepository;

    // 메시지 전송 REST 엔드포인트
    @PostMapping("/message")
    public ResponseEntity<ChatMessageDto> sendMessage(@RequestBody ChatMessageDto chatMessageDto) {
        ChatMessageDto sentMessage = chatService.sendMessage(chatMessageDto);
        return ResponseEntity.ok(sentMessage);
    }

    @MessageMapping("/chat.sendMessage")
    public void handleWebSocketMessage(@Payload ChatMessageDto chatMessageDto) {
        try {
            // 채팅방 존재 확인
            ChatRoom chatRoom = chatRoomRepository.findById(chatMessageDto.getChatRoomId())
                    .orElseThrow(() -> new ChatRoomNotFountException("삭제된 채팅방입니다."));

            // 블랙리스트 확인 (사용자가 블랙리스트에 등록되어 있는지)
            boolean isBlocked = false;
            if ("USER".equals(chatMessageDto.getSenderType())) {
                isBlocked = blacklistRepository.findByUserAndSalon(
                        chatRoom.getUser(), chatRoom.getSalon()).isPresent();
            }

            if (isBlocked) {
                // 블랙리스트 에러 응답
                sendErrorMessage(chatMessageDto.getSenderId(), "차단된 사용자입니다.");
                return;
            }

            // 기존 메시지 처리 로직...
            ChatMessageDto processedMessage = chatService.sendMessage(chatMessageDto);

            // 발신자와 수신자에게 메시지 전송...
        } catch (ChatRoomNotFountException e) {
            // 채팅방 삭제 에러 응답
            sendErrorMessage(chatMessageDto.getSenderId(), e.getMessage());
        } catch (Exception e) {
            log.error("메시지 처리 중 오류 발생", e);
            sendErrorMessage(chatMessageDto.getSenderId(), "메시지 전송 중 오류가 발생했습니다.");
        }
    }

    private void sendErrorMessage(String userId, String errorMessage) {
        Map<String, Object> errorResponse = new HashMap<>();
        errorResponse.put("error", true);
        errorResponse.put("code", "CHAT_ROOM_DELETED");
        errorResponse.put("message", errorMessage);

        messagingTemplate.convertAndSendToUser(
                userId,
                "/queue/messages",
                errorResponse
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
        try {
            ChatRoom chatRoom = chatRoomRepository.findById(roomId)
                    .orElseThrow(() -> new ChatRoomNotFountException("채팅방을 찾을 수 없습니다."));

            Map<String, Object> roomInfo = new HashMap<>();
            roomInfo.put("id", chatRoom.getId());
            roomInfo.put("userId", chatRoom.getUser().getId());
            roomInfo.put("salonId", chatRoom.getSalon().getId());
            roomInfo.put("salonName", chatRoom.getSalon().getName());
            roomInfo.put("userName", chatRoom.getUser().getNickname());
            roomInfo.put("userLanguage", chatRoom.getUser().getLanguage() != null ? chatRoom.getUser().getLanguage() : "en");
            roomInfo.put("salonLanguage", "ko");

            // 프로필 이미지 URL 추가
            roomInfo.put("userProfileUrl", chatRoom.getUser().getProfile());

            // 미용실 프로필 이미지 가져오기
            List<SalonPhotos> salonPhotos = salonPhotosRepository.findBySalon_IdOrderByPhotoOrderAsc(chatRoom.getSalon().getId());
            String salonProfileUrl = !salonPhotos.isEmpty() ? salonPhotos.get(0).getPhotoUrl() : null;
            roomInfo.put("salonProfileUrl", salonProfileUrl);

            return ResponseEntity.ok(roomInfo);
        } catch (ChatRoomNotFountException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", true, "message", e.getMessage()));
        }
    }

    // 예약 ID를 통해 채팅방 생성 또는 조회
    @PostMapping("/room/reservation/{reservationId}")
    public ResponseEntity<ChatRoomDto> createChatRoomByReservation(@PathVariable Long reservationId) {
        return ResponseEntity.ok(chatService.getChatRoomByReservation(reservationId));
    }

    @DeleteMapping("/room/{chatRoomId}")
    public ResponseEntity<?> deleteChatRoom(@PathVariable Long chatRoomId) {
        try {
            // 삭제 전에 채팅방 정보 조회
            ChatRoom chatRoom = chatRoomRepository.findById(chatRoomId)
                    .orElseThrow(() -> new ChatRoomNotFountException("채팅방을 찾을 수 없습니다."));

            // 연결된 사용자들에게 채팅방 삭제 알림
            Map<String, Object> deleteNotification = new HashMap<>();
            deleteNotification.put("error", true);
            deleteNotification.put("code", "CHAT_ROOM_DELETED");
            deleteNotification.put("message", "채팅방이 삭제되었습니다.");
            deleteNotification.put("chatRoomId", chatRoomId);

            // 사용자에게 알림
            messagingTemplate.convertAndSendToUser(
                    chatRoom.getUser().getId(),
                    "/queue/messages",
                    deleteNotification
            );

            // 미용실에게 알림
            messagingTemplate.convertAndSendToUser(
                    chatRoom.getSalon().getId(),
                    "/queue/messages",
                    deleteNotification
            );

            // 채팅방 삭제 처리
            chatService.deleteChatRoom(chatRoomId);

            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", true, "message", e.getMessage()));
        }
    }

    @GetMapping("/room/check/{chatRoomId}")
    public ResponseEntity<?> checkChatRoomExists(@PathVariable Long chatRoomId) {
        boolean exists = chatRoomRepository.existsById(chatRoomId);
        if (!exists) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok().build();
    }
}