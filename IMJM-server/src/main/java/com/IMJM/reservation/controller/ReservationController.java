package com.IMJM.reservation.controller;

import com.IMJM.reservation.dto.ReservationServiceMenuDto;
import com.IMJM.reservation.dto.StylistAndSalonDetailsDto;
import com.IMJM.reservation.dto.ReservationStylistDto;
import com.IMJM.reservation.service.ReservationStylistService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/hairsalon")
@RequiredArgsConstructor
public class ReservationController {

    private final ReservationStylistService reservationStylistService;


    // 특정 살롱의 스타일리스트 조회
    @GetMapping("/stylists/{salonId}")
    public ResponseEntity<?> getStylistsBySalon(@PathVariable String salonId) {
        List<ReservationStylistDto> stylists = reservationStylistService.getStylistsBySalon(salonId);
        return stylists.isEmpty()
                ? ResponseEntity.noContent().build()
                : ResponseEntity.ok(stylists);
    }

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
            @RequestParam String date

    ) {
        LocalDate localDate = LocalDate.parse(date);
        Map<String, List<String>> result = reservationStylistService.getAvailableAndBookedTimeMap(stylistId, localDate);
        return ResponseEntity.ok(result);
    }

    // 살롱의 서비스_메뉴 조회
    @GetMapping("/reservations/service-menus/{salonId}")
    public ResponseEntity<?> getServiceMenu(@PathVariable String salonId) {
        List<ReservationServiceMenuDto> menus = reservationStylistService.getServiceMenusBySalonId(salonId);
        return ResponseEntity.ok(menus);
    }
}
