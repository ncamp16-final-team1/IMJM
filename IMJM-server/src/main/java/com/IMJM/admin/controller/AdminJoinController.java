package com.IMJM.admin.controller;

import com.IMJM.admin.dto.CustomSalonDetails;
import com.IMJM.admin.dto.SalonDto;
import com.IMJM.admin.service.AdminJoinService;
import com.IMJM.admin.service.SalonPhotosService;
import com.IMJM.jwt.JWTUtil;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin")
public class AdminJoinController {

    private final AdminJoinService adminJoinService;
    private final SalonPhotosService salonPhotosService;
    private final JWTUtil jwtUtil;

    @PostMapping(value = "/join", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> joinProcess(@RequestPart SalonDto joinDTO,
                                         @RequestPart List<MultipartFile> photos) {
        adminJoinService.joinProcess(joinDTO, photos);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/check-id")
    public ResponseEntity<Map<String, Boolean>> checkId(@RequestParam String id) {
        return ResponseEntity.ok(Map.of("available", adminJoinService.checkId(id)));
    }

    @GetMapping("/check-login")
    public ResponseEntity<?> checkLogin(HttpServletRequest request) {
        return adminJoinService.checkLogin(request);
    }

    @GetMapping("/salons/my")
    public ResponseEntity<SalonDto> getMySalon(@AuthenticationPrincipal CustomSalonDetails salonDetails) {

        return ResponseEntity.ok(adminJoinService.selectSalonById(salonDetails));
    }

    @PostMapping("/logout")
    public void logout(HttpServletResponse response) {
        ResponseCookie cookie = ResponseCookie.from("AdminToken", null)
            .httpOnly(true)
            .secure(true)
            .sameSite("None")
            .path("/")
            .domain("imjm-hair-partner.com")
            .maxAge(0) // 즉시 만료
            .build();

        response.setHeader("Set-Cookie", cookie.toString());
    }

    @GetMapping("/salon-photos")
    public ResponseEntity<List<String>> getPhotosBySalonId(@AuthenticationPrincipal CustomSalonDetails salonDetails) {
        List<String> photoUrls = salonPhotosService.getPhotosBySalonId(salonDetails.getSalon().getId());
        return ResponseEntity.ok(photoUrls);
    }

    @PostMapping(value = "/salons/update", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> salonUpdate(@AuthenticationPrincipal CustomSalonDetails salonDetails,
                                         @RequestPart SalonDto salonUpdateDto,
                                         @RequestPart(required = false) List<MultipartFile> newPhotos) {
        adminJoinService.updateProcess(salonDetails.getSalon().getId(), salonUpdateDto, newPhotos);
        return ResponseEntity.ok().build();
    }
}
