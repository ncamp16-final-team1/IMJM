package com.IMJM.reservation.controller;

import com.IMJM.reservation.dto.ReservationStylistDto;
import com.IMJM.reservation.service.StylistService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/hairsalon")
@RequiredArgsConstructor
public class StylistController {

    private final StylistService stylistService;

    // 특정 살롱의 스타일리스트 조회
    @GetMapping("/stylists/{salonId}")
    public ResponseEntity<?> getStylistsBySalon(@PathVariable String salonId) {
        List<ReservationStylistDto> stylists = stylistService.getStylistsBySalon(salonId);
        return stylists.isEmpty()
                ? ResponseEntity.noContent().build()
                : ResponseEntity.ok(stylists);
    }

    // 특정 스타일리스트 상세조회 및 예약가능 날짜 조회
    @GetMapping("/stylist/{stylistId}")
    public ResponseEntity<?> getAvailableDates(@PathVariable Integer stylistId) {
        try {
            ReservationStylistDto stylistDetail = stylistService.getStylistById(stylistId);
            return ResponseEntity.ok(stylistDetail);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
