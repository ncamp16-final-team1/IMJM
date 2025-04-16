package com.IMJM.admin.controller;

import com.IMJM.admin.dto.CustomSalonDetails;
import com.IMJM.admin.dto.SalonDto;
import com.IMJM.admin.service.JoinService;
import com.IMJM.admin.service.SalonPhotosService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api")
public class JoinController {

    private final JoinService joinService;
    private final SalonPhotosService salonPhotosService;

    public JoinController(JoinService joinService,
                          SalonPhotosService salonPhotosService) {
        this.joinService = joinService;
        this.salonPhotosService = salonPhotosService;
    }

    @PostMapping(value = "/admin/join", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> joinProcess(@RequestPart SalonDto joinDTO,
                                         @RequestPart List<MultipartFile> photos) {
        joinService.joinProcess(joinDTO, photos);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/check-login")
    public ResponseEntity<?> checkLogin(HttpServletRequest request) {
        return ResponseEntity.ok().build();
    }

    @GetMapping("/salons/my")
    public ResponseEntity<SalonDto> getMySalon(@AuthenticationPrincipal CustomSalonDetails salonDetails) {

        return ResponseEntity.ok(joinService.selectSalonById(salonDetails));
    }

    @PostMapping("/logout")
    public void logout(HttpServletResponse response) {
        Cookie cookie = new Cookie("AdminToken", null);
        cookie.setMaxAge(0); // 즉시 만료
        cookie.setHttpOnly(true);
        cookie.setPath("/");

        response.addCookie(cookie);
        System.out.println("logout success");
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
        joinService.updateProcess(salonDetails.getSalon().getId(), salonUpdateDto, newPhotos);
        return ResponseEntity.ok().build();
    }
}