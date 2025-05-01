package com.IMJM.admin.controller;

import com.IMJM.admin.dto.AdminReservationDto;
import com.IMJM.admin.dto.AdminReservationDto.*;
import com.IMJM.admin.dto.CustomSalonDetails;
import com.IMJM.admin.service.AdminReservationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/reservation")
@RequiredArgsConstructor
public class AdminReservationController {

    private final AdminReservationService adminReservationService;

    @GetMapping("")
    public ResponseEntity<?> getAdminReservation(@AuthenticationPrincipal CustomSalonDetails salonDetails,
                                                 @RequestParam String date) {
        List<AdminReservationDto> adminReservationDtos =
                adminReservationService.getAdminReservation(salonDetails.getSalon().getId(), date);

        return ResponseEntity.ok().body(adminReservationDtos);
    }

    @PutMapping("/{reservationId}")
    public ResponseEntity<?> updateReservation(@PathVariable Long reservationId,
                                               @RequestBody AdminReservationUpdateDto adminReservationUpdateDto) {
        adminReservationService.updateReservation(reservationId, adminReservationUpdateDto);

        return ResponseEntity.ok().build();
    }

    @GetMapping("/stats")
    public ResponseEntity<?> getAdminReservationStats(@AuthenticationPrincipal CustomSalonDetails salonDetails) {
        Map<String, Long> weekly = adminReservationService.getWeeklyReservationStats(salonDetails.getSalonId());
        Map<String, Long> monthly = adminReservationService.getMonthlyReservationStats(salonDetails.getSalonId());

        System.out.println(weekly);
        System.out.println(monthly);

        Map<String, Map<String, Long>> result = new HashMap<>();

        result.put("weekly", weekly);
        result.put("monthly", monthly);

        return ResponseEntity.ok().body(result);
    }
}
