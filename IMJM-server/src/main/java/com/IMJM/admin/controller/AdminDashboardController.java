package com.IMJM.admin.controller;

import com.IMJM.admin.dto.AdminReservationDto;
import com.IMJM.admin.dto.CustomSalonDetails;
import com.IMJM.admin.service.AdminReservationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/dashboard")
public class AdminDashboardController {

    private final AdminReservationService adminReservationService;

    @GetMapping("/reservation")
    public ResponseEntity<?> dashboardReservation(@AuthenticationPrincipal CustomSalonDetails salonDetails){
        String today = "today";
        List<AdminReservationDto> todayReservationDtos = adminReservationService.getAdminReservation(salonDetails.getSalonId(), today);

        return ResponseEntity.ok().body(todayReservationDtos);
    }
}
