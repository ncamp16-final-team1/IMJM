package com.IMJM.user.controller;

import com.IMJM.user.dto.CustomOAuth2UserDto;
import com.IMJM.user.dto.LocationDto;
import com.IMJM.user.dto.UserDto;
import com.IMJM.user.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/user")
public class UserController {

    private final UserService userService;

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestPart("userDto") UserDto userDto,
                                          @RequestPart(value = "profile", required = false) MultipartFile profile) {

        if(userDto.getUserType().equals("MEMBER")) {
            userService.completeMemberRegistration(userDto ,profile);
        }
        return ResponseEntity.ok("회원가입 완료");
    }

    @PostMapping("/logout")
    public void logout(HttpServletResponse response) {
        userService.logout(response);
    }

    @GetMapping("/check-login")
    public ResponseEntity<?> checkLogin(HttpServletRequest request) {
        return userService.checkLogin(request);
    }

    @GetMapping("/location")
    public ResponseEntity<?> getUserLocation(@AuthenticationPrincipal CustomOAuth2UserDto userDetails) {
        LocationDto location = null;
        if (userDetails != null) {
            location = userService.getUserLocation(userDetails.getId());
        } else {
            location = userService.getUserLocation("anonymous");
        }
        return ResponseEntity.ok(location);
    }

    @PutMapping("/location")
    public ResponseEntity<?> updateUserLocation(
            @AuthenticationPrincipal CustomOAuth2UserDto userDetails,
            @RequestParam BigDecimal latitude,
            @RequestParam BigDecimal longitude) {

        log.info("위치정보를 업데이트합니다.");

        // 로그인한 사용자만 위치 저장 가능
        if (userDetails == null) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body("위치 정보를 저장하려면 로그인이 필요합니다.");
        }

        userService.updateUserLocation(userDetails.getId(), latitude, longitude);
        return ResponseEntity.ok("위치 정보가 업데이트되었습니다.");
    }
}
