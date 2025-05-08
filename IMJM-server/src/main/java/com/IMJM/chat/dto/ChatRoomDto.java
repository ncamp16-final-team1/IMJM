package com.IMJM.chat.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

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
    private OffsetDateTime createdAt;
    private OffsetDateTime lastMessageTime;
    private String lastMessage;
    private boolean hasUnreadMessages;
    private int unreadCount;
    private String userProfileUrl;
    private String salonProfileUrl;
}
