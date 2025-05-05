package com.IMJM.reservation.controller;

import com.IMJM.reservation.dto.PopularSalonDto;
import com.IMJM.reservation.service.PopularSalonService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/salon")
@RequiredArgsConstructor
public class PopularSalonController {

    private final PopularSalonService popularSalonService;

    @GetMapping("/popular")
    public ResponseEntity<List<PopularSalonDto>> getPopularSalons() {
        List<PopularSalonDto> popularSalons = popularSalonService.getTop5PopularSalons();
        return ResponseEntity.ok(popularSalons);
    }
}