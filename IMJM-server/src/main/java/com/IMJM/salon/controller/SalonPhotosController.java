package com.IMJM.salon.controller;

import com.IMJM.admin.dto.SalonPhotoDto;
import com.IMJM.admin.service.SalonPhotosService;
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
public class SalonPhotosController {

    private final SalonPhotosService salonPhotosService;

    @GetMapping("salon/{salonId}/photos")
    public ResponseEntity<List<SalonPhotoDto>> getSalonPhotos(@PathVariable String salonId) {
        List<SalonPhotoDto> photos = salonPhotosService.getSalonPhotosBySalonId(salonId);
        return ResponseEntity.ok(photos);
    }
}
