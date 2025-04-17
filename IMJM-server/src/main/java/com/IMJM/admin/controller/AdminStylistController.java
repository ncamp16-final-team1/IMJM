package com.IMJM.admin.controller;

import com.IMJM.admin.dto.AdminStylistDto;
import com.IMJM.admin.dto.CustomSalonDetails;
import com.IMJM.admin.service.AdminStylistService;
import com.IMJM.common.entity.AdminStylist;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/admin/stylist")
@RequiredArgsConstructor
public class AdminStylistController {

    private final AdminStylistService adminStylistService;

    @PostMapping("/register")
    public ResponseEntity<?> adminStylistRegister(@RequestPart("adminStylistDto") AdminStylistDto adminStylistDto,
                                                  @RequestPart(value = "profile", required = false) MultipartFile profile,
                                                  @AuthenticationPrincipal CustomSalonDetails salonDetails) {

        adminStylistService.adminStylistRegister(adminStylistDto, profile, salonDetails);

        return ResponseEntity.ok().build();
    }

    @GetMapping("/stylists")
    public ResponseEntity<List<AdminStylistDto>> getAllStylists(@AuthenticationPrincipal CustomSalonDetails salonDetails) {
        List<AdminStylistDto> adminStylistDto = adminStylistService.getAllStylists(salonDetails.getSalon().getId());
        return ResponseEntity.ok(adminStylistDto);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateStylist(@PathVariable Long id,
                                           @RequestPart("adminStylistDto") AdminStylistDto adminStylistDto,
                                           @RequestPart(value = "profile", required = false) MultipartFile profile){
        adminStylistService.updateStylist(id, adminStylistDto, profile);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteStylist(@PathVariable Long id) {
        adminStylistService.deleteStylist(id);
        return ResponseEntity.ok().build();
    }
}
