package com.IMJM.salon.controller;

import com.IMJM.admin.dto.SalonDto;
import com.IMJM.common.entity.Users;
import com.IMJM.salon.service.SalonService;
import com.IMJM.user.dto.CustomOAuth2UserDto;
import com.IMJM.user.dto.LocationDto;
import com.IMJM.user.dto.UserDto;
import com.IMJM.user.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@Slf4j
@RestController
@RequestMapping("/api/salon")
@RequiredArgsConstructor
public class SalonController {

    private final SalonService salonService;
    private final UserService userService;


    @GetMapping("/{id}")
    public ResponseEntity<?> getSalonById(@PathVariable String id) {
        SalonDto salon = salonService.getSalonById(id);
        return ResponseEntity.ok(salon);
    }

    @GetMapping
    public ResponseEntity<?> getSalons(
            @AuthenticationPrincipal CustomOAuth2UserDto loginUser,
            @PageableDefault Pageable pageable) {

        // 무조건 위치 정보가 있음.(/location을 이미 실행하고 넘어온 상태)
        LocationDto location = null;
        if (loginUser == null) {
            location = userService.getUserLocation("anonymous");
        } else {
            location = userService.getUserLocation(loginUser.getUser().getId());
        }

        Page<SalonDto> nearbySalons = salonService.findNearbySalons(location, pageable);
        return ResponseEntity.ok(nearbySalons);
    }
}