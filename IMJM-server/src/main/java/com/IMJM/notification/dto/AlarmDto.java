package com.IMJM.notification.dto;

import com.IMJM.common.entity.Alarm;
import lombok.*;

import java.time.OffsetDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AlarmDto {
    private Long id;
    private String userId;
    private String title;
    private String content;
    private boolean isRead;
    private String notificationType;
    private Integer referenceId;
    private OffsetDateTime createdAt;

    // 엔티티를 DTO로 변환하는 정적 메서드
    public static AlarmDto fromEntity(Alarm alarm) {
        return AlarmDto.builder()
                .id(alarm.getId())
                .userId(alarm.getUser().getId())
                .title(alarm.getTitle())
                .content(alarm.getContent())
                .isRead(alarm.isRead())
                .notificationType(alarm.getNotificationType())
                .referenceId(alarm.getReferenceId())
                .createdAt(alarm.getCreatedAt())
                .build();
    }
}
