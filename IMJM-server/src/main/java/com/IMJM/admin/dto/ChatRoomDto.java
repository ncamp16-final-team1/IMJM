package com.IMJM.admin.dto;

import lombok.*;
import java.time.OffsetDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatRoomDto {
    private Long id;
    private String userId;
    private String salonId;
    private String salonName;
    private String userName;
    private OffsetDateTime createdAt;
    private OffsetDateTime lastMessageTime;
    private String lastMessage;
    private boolean hasUnreadMessages;
    private int unreadCount;
}