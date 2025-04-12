package com.IMJM.chat.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatRoomDto {

    private Long id;
    private String userId;
    private String salonId;
    private String salonName;  // 미용실 이름 (표시용)
    private String userName;   // 사용자 이름 (표시용)
    private LocalDateTime createdAt;
    private LocalDateTime lastMessageTime;
    private String lastMessage;
    private boolean hasUnreadMessages;
}
