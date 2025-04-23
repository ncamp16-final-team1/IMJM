package com.IMJM.admin.dto;

import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatMessageDto {
    private Long id;
    private Long chatRoomId;
    private String senderType;  // 'USER' 또는 'SALON'
    private String senderId;
    private String message;
    private Boolean isRead;
    private LocalDateTime sentAt;
    private String translatedMessage;
    private String translationStatus;
    private List<ChatPhotoDto> photos;
}