package com.IMJM.admin.repository;

import com.IMJM.admin.dto.ChatMessageDto;
import com.IMJM.admin.dto.ChatRoomDto;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface AdminChatRepository {
    void sendMessage(ChatMessageDto messageDto);
    List<ChatRoomDto> getSalonChatRooms(String salonId);
    List<ChatMessageDto> getChatMessages(Long chatRoomId);
    void markMessagesAsRead(Long chatRoomId);
    String uploadChatImage(MultipartFile file, Long chatRoomId);
}