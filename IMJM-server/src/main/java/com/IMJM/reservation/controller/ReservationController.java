package com.IMJM.reservation.controller;

import com.IMJM.reservation.dto.ReservationStylistDto;
import com.IMJM.reservation.dto.StylistAndSalonDetailsDto;
import com.IMJM.reservation.service.ReservationStylistService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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

    // 특정 살롱의 휴뮤 및 특정 스타일리스트 휴무 조회
    @GetMapping("/reservation/{stylistId}")
    public ResponseEntity<?> getStylistDetailAndHoliday(@PathVariable Long stylistId) {
        try {
            StylistAndSalonDetailsDto stylistAndSalonDetailsDto = reservationStylistService.getStylistAndSalonDetails(stylistId);
            return ResponseEntity.ok(stylistAndSalonDetailsDto); // 성공 시 200 OK
        } catch (EntityNotFoundException e) {
            // 스타일리스트를 찾을 수 없을 경우 404 Not Found
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("스타일리스트를 찾을 수 없습니다.");
        } catch (Exception e) {
            // 예기치 못한 오류는 500 Internal Server Error
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("서버 오류가 발생했습니다.");
        }
    }



}
