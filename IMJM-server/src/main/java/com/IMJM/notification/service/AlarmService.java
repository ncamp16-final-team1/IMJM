package com.IMJM.notification.service;

import com.IMJM.common.entity.Alarm;
import com.IMJM.common.entity.Users;
import com.IMJM.notification.dto.AlarmDto;
import com.IMJM.notification.repository.AlarmRepository;
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

        // 사용자의 알림 설정 확인
        if (!user.isNotification()) {
            log.info("알림 설정이 비활성화되어 있어 알림을 생성하지 않습니다. 사용자 ID: {}", userId);
            return null;
        }

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
    }

    @Transactional
    public void markAllAsRead(String userId) {
        List<Alarm> unreadAlarms = alarmRepository.findByUserIdAndIsReadFalse(userId);

        unreadAlarms.forEach(alarm -> alarm.setIsRead(true));

        alarmRepository.saveAll(unreadAlarms);
    }

    @Transactional(readOnly = true)
    public int countUnreadAlarms(String userId) {
        return alarmRepository.countByUserIdAndIsReadFalse(userId);
    }
}
