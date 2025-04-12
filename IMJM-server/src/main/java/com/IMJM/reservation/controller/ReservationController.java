package com.IMJM.reservation.controller;

import com.IMJM.reservation.dto.ReservationStylistDto;
import com.IMJM.reservation.dto.StylistAndSalonDetailsDto;
import com.IMJM.reservation.repository.ReservationRepository;
import com.IMJM.reservation.service.ReservationStylistService;
import com.IMJM.user.dto.CustomOAuth2UserDto;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/hairsalon")
@RequiredArgsConstructor
public class ReservationController {

    private final ReservationStylistService reservationStylistService;

    private final ReservationRepository reservationRepository;

    // 특정 살롱의 스타일리스트 조회
    @GetMapping("/stylists/{salonId}")
    public ResponseEntity<?> getStylistsBySalon(@PathVariable String salonId) {
        List<ReservationStylistDto> stylists = reservationStylistService.getStylistsBySalon(salonId);
        return stylists.isEmpty()
                ? ResponseEntity.noContent().build()
                : ResponseEntity.ok(stylists);
    }

    // 특정 살롱의 휴뮤 및 특정 스타일리스트 휴무 조회
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


    // 날짜 클릭 시 예약 가능한 시간대 반환
    @GetMapping("/reservations/available-times")
    public ResponseEntity<?> getAvailableTimes(
            @RequestParam("stylistId") Long stylistId,
//            @RequestParam("date") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam String date,
            @AuthenticationPrincipal CustomOAuth2UserDto userDetails
    ) {
//        if (userDetails == null) {
//            // 로그인되지 않은 경우
//            Map<String, Object> response = new HashMap<>();
//            response.put("message", "로그인이 필요합니다");
//            response.put("authenticated", false);
//            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
//        }
        LocalDate localDate = LocalDate.parse(date);
        Map<String, List<String>> result = reservationStylistService.getAvailableAndBookedTimeMap(stylistId, localDate);
        return ResponseEntity.ok(result);
    }
}
