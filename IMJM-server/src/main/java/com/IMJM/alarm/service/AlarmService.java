package com.IMJM.alarm.service;

import com.IMJM.common.entity.Alarm;
import com.IMJM.common.entity.Users;
import com.IMJM.alarm.dto.AlarmDto;
import com.IMJM.alarm.repository.AlarmRepository;
import com.IMJM.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AlarmService {

    private final AlarmRepository alarmRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Transactional
    public AlarmDto createAlarm(String userId, String title, String content,
                                String notificationType, Integer referenceId) {

        Users user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Alarm alarm = Alarm.builder()
                .user(user)
                .title(title)
                .content(content)
                .isRead(false)
                .notificationType(notificationType)
                .referenceId(referenceId)
                .createdAt(LocalDateTime.now())
                .build();

        alarm = alarmRepository.save(alarm);

        // DTO 변환
        AlarmDto alarmDto = AlarmDto.fromEntity(alarm);

        // WebSocket을 통해 알림 전송
        messagingTemplate.convertAndSendToUser(
                userId,
                "/queue/notifications",
                alarmDto
        );

        log.info("Created alarm for user {}: {}", userId, alarm.getTitle());

        return alarmDto;
    }

    @Transactional(readOnly = true)
    public List<AlarmDto> getUserAlarms(String userId) {
        return alarmRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(AlarmDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public void markAsRead(Long alarmId) {
        Alarm alarm = alarmRepository.findById(alarmId)
                .orElseThrow(() -> new RuntimeException("Alarm not found"));

        alarm.setIsRead(true);
        alarmRepository.save(alarm);

        log.info("Marked alarm as read: {}", alarmId);
    }

    @Transactional(readOnly = true)
    public int countUnreadAlarms(String userId) {
        return alarmRepository.countByUserIdAndIsReadFalse(userId);
    }
}
