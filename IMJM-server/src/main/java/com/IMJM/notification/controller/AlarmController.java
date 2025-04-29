package com.IMJM.notification.controller;

import com.IMJM.notification.dto.AlarmDto;
import com.IMJM.notification.service.AlarmService;
import com.IMJM.user.dto.CustomOAuth2UserDto;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/alarms")
@RequiredArgsConstructor
public class AlarmController {

    private final AlarmService alarmService;

    @GetMapping
    public ResponseEntity<List<AlarmDto>> getUserAlarms(
            @AuthenticationPrincipal CustomOAuth2UserDto userDetails) {

        String userId = userDetails.getId();
        List<AlarmDto> alarms = alarmService.getUserAlarms(userId);

        return ResponseEntity.ok(alarms);
    }

    @GetMapping("/unread/count")
    public ResponseEntity<Map<String, Integer>> getUnreadCount(
            @AuthenticationPrincipal CustomOAuth2UserDto userDetails) {

        String userId = userDetails.getId();
        int count = alarmService.countUnreadAlarms(userId);

        return ResponseEntity.ok(Map.of("count", count));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable Long id) {
        alarmService.markAsRead(id);
        return ResponseEntity.ok().build();
    }

    // 테스트용 엔드포인트 (나중에 제거 가능)
    @PostMapping("/test")
    public ResponseEntity<AlarmDto> createTestAlarm(
            @AuthenticationPrincipal CustomOAuth2UserDto userDetails,
            @RequestBody Map<String, String> payload) {

        String userId = userDetails.getId();
        String title = payload.getOrDefault("title", "테스트 알림");
        String content = payload.getOrDefault("content", "이것은 테스트 알림입니다.");
        String type = payload.getOrDefault("type", "TEST");

        AlarmDto createdAlarm = alarmService.createAlarm(
                userId, title, content, type, null
        );

        return ResponseEntity.ok(createdAlarm);
    }
}