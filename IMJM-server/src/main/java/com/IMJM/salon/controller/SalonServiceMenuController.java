package com.IMJM.salon.controller;

import com.IMJM.salon.dto.SalonServiceMenuDto;
import com.IMJM.salon.service.SalonServiceMenuService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class SalonServiceMenuController {

    private final SalonServiceMenuService salonServiceMenuService;

    @GetMapping("/salon/{salonId}/menu")
    public ResponseEntity<List<SalonServiceMenuDto>> getServiceMenusBySalonId(@PathVariable String salonId) {
        List<SalonServiceMenuDto> serviceMenus = salonServiceMenuService.getServiceMenusBySalonId(salonId);
        return ResponseEntity.ok(serviceMenus);
    }

    @GetMapping("/salon/{salonId}/menu/types/{serviceType}")
    public ResponseEntity<List<SalonServiceMenuDto>> getServiceMenusByType(
            @PathVariable String salonId,
            @PathVariable String serviceType) {
        List<SalonServiceMenuDto> serviceMenus = salonServiceMenuService.getServiceMenusByType(salonId, serviceType);
        return ResponseEntity.ok(serviceMenus);
    }

    @GetMapping("/menu/{id}")
    public ResponseEntity<SalonServiceMenuDto> getServiceMenuById(@PathVariable Long id) {
        SalonServiceMenuDto serviceMenu = salonServiceMenuService.getServiceMenuById(id);
        return ResponseEntity.ok(serviceMenu);
    }
}