package com.IMJM.salon.controller;

import com.IMJM.admin.dto.SalonDto;
import com.IMJM.salon.service.SalonService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;


@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class SalonController {

    private final SalonService salonService;

    @GetMapping("/salon/{id}")
    public ResponseEntity<?> getSalonById(@PathVariable String id) {
        SalonDto salon = salonService.getSalonById(id);
        System.out.println(salon.getId());
        System.out.println(salon.getName());
        return salon != null
                ? ResponseEntity.ok(salon)
                : ResponseEntity.notFound().build();
    }

    @GetMapping("/salon")
    public ResponseEntity<?> getAllSalons() {
        List<SalonDto> salons = salonService.getAllSalons();
        return ResponseEntity.ok()
                .body(salons);
    }
}