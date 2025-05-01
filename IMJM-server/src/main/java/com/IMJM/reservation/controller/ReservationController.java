package com.IMJM.reservation.controller;

import com.IMJM.reservation.dto.*;
import com.IMJM.reservation.service.ReservationStylistService;
import com.IMJM.user.dto.CustomOAuth2UserDto;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.ErrorResponse;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/salon")
@RequiredArgsConstructor
@Slf4j
public class ReservationController {

    private final ReservationStylistService reservationStylistService;

    @GetMapping("/stylists/{salonId}")
    public ResponseEntity<?> getStylistsBySalon(@PathVariable String salonId) {
        List<ReservationStylistDto> stylists = reservationStylistService.getStylistsBySalon(salonId);
        return stylists.isEmpty()
                ? ResponseEntity.noContent().build()
                : ResponseEntity.ok(stylists);
    }

    // 예약가능한
    @GetMapping("/reservation/{stylistId}")
    public ResponseEntity<?> getStylistDetailAndHoliday(@PathVariable Long stylistId) {
        try {
            StylistAndSalonDetailsDto stylistAndSalonDetailsDto = reservationStylistService
                    .getStylistAndSalonDetails(stylistId);
            return ResponseEntity.ok(stylistAndSalonDetailsDto);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("스타일리스트를 찾을 수 없습니다.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("서버 오류가 발생했습니다.");
        }
    }

    @GetMapping("/reservations/available-times")
    public ResponseEntity<?> getAvailableTimes(
            @RequestParam("stylistId") Long stylistId,
            @RequestParam String date

    ) {
        LocalDate localDate = LocalDate.parse(date);
        Map<String, List<String>> result = reservationStylistService.getAvailableAndBookedTimeMap(stylistId, localDate);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/reservations/service-menus/{salonId}")
    public ResponseEntity<?> getServiceMenu(@PathVariable String salonId) {
        List<ReservationServiceMenuDto> menus = reservationStylistService.getServiceMenusBySalonId(salonId);
        return ResponseEntity.ok(menus);
    }

    @GetMapping("/reservation/coupons")
    public ResponseEntity<List<SalonCouponDto>> getCoupons(
            @RequestParam String salonId,
            @RequestParam String totalAmount,
            @AuthenticationPrincipal CustomOAuth2UserDto customOAuth2UserDto
    ) {
    String userId = customOAuth2UserDto.getId();

        try {
            int totalAmountInt = Integer.parseInt(totalAmount);

            List<SalonCouponDto> coupons = reservationStylistService.getCoupons(salonId, totalAmountInt, userId);

            return ResponseEntity.ok(coupons);

        } catch (NumberFormatException e) {

            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/points/available")
    public ResponseEntity<?> getUserPoint(
        @AuthenticationPrincipal CustomOAuth2UserDto customOAuth2UserDto
    ) {
        String userId = customOAuth2UserDto.getId();

        try {
            UserPointDto userPointDto = reservationStylistService.getUserPoint(userId);
            return ResponseEntity.ok(userPointDto);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "User not found with id: " + userId));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error retrieving user points: " + e.getMessage()));
        }
    }

    @PostMapping("/reservation/complete")
    public ResponseEntity<?> completeReservation(@RequestBody ReservationRequestDto  request,
        @AuthenticationPrincipal CustomOAuth2UserDto customOAuth2UserDto
    ) {
        try {
            String userId = customOAuth2UserDto.getId();
            log.info("예약 완료 요청: {}", request);
            reservationStylistService.completeReservation(request, userId);

            Map<String, Object> successResponse = new HashMap<>();
            successResponse.put("success", true);
            successResponse.put("message", "예약이 성공적으로 완료되었습니다.");

            return ResponseEntity.ok(successResponse);
        } catch (Exception e) {
            log.error("예약 처리 중 오류 발생", e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "예약 처리 중 오류가 발생했습니다.");
            errorResponse.put("error", e.getMessage());

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }



}
