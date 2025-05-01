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

    @PutMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead(
            @AuthenticationPrincipal CustomOAuth2UserDto userDetails) {
        String userId = userDetails.getId();
        alarmService.markAllAsRead(userId);
        return ResponseEntity.ok().build();
    }
}