package com.IMJM.reservation.controller;

import com.IMJM.reservation.dto.StylistDto;
import com.IMJM.reservation.service.ReservationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/hairsalon/reservation")
@RequiredArgsConstructor
//@CrossOrigin(origins = "http://localhost:5173")
public class ReservationController {

    private final ReservationService reservationService;

    // 특정 살롱의 스타일리스트 조회
    @GetMapping("/{salonId}")
    public ResponseEntity<List<StylistDto>> getStylistsBySalon(@PathVariable String salonId) {
        List<StylistDto> stylists = reservationService.getStylistsBySalon(salonId);
        return stylists.isEmpty()
                ? ResponseEntity.noContent().build()
                : ResponseEntity.ok(stylists);
    }

}
