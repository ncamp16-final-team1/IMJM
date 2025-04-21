package com.IMJM.admin.controller;

import com.IMJM.admin.dto.AdminReservationDto;
import com.IMJM.admin.dto.AdminReservationDto.*;
import com.IMJM.admin.dto.CustomSalonDetails;
import com.IMJM.admin.service.AdminReservationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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
}
