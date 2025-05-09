package com.IMJM.user.controller;

import com.IMJM.common.entity.Users;
import com.IMJM.user.dto.CustomOAuth2UserDto;
import com.IMJM.user.dto.LocationDto;
import com.IMJM.user.dto.UserDto;
import com.IMJM.user.repository.UserRepository;
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
import java.util.Map;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/user")
public class UserController {

    private final UserService userService;
    private final UserRepository userRepository;

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestPart("userDto") UserDto userDto,
                                          @RequestPart(value = "profile", required = false) MultipartFile profile,
                                          @RequestPart(value = "license", required = false) MultipartFile license) {
        userService.completeMemberRegistration(userDto ,profile, license);
        return ResponseEntity.ok("회원가입 완료");
    }

    @GetMapping("/check-nickname")
    public ResponseEntity<Map<String, Boolean>> checkNickname(@RequestParam String nickname) {
        return ResponseEntity.ok(Map.of("available", userService.isNicknameAvailable(nickname)));
    }

    @PostMapping("/logout")
    public void logout(HttpServletResponse response) {
        userService.logout(response);
    }

    @GetMapping("/check-login")
    public ResponseEntity<?> checkLogin(HttpServletRequest request) {
        return userService.checkLogin(request);
    }

    @DeleteMapping("/delete-account")
    public ResponseEntity<?> deleteAccount(@AuthenticationPrincipal CustomOAuth2UserDto auth2UserDto) {
        userService.deleteAccount(auth2UserDto.getId());
        return ResponseEntity.ok().build();
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

        if (userDetails == null) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body("위치 정보를 저장하려면 로그인이 필요합니다.");
        }

        userService.updateUserLocation(userDetails.getId(), latitude, longitude);
        return ResponseEntity.ok("위치 정보가 업데이트되었습니다.");
    }

    @GetMapping("/my-profile")
    public ResponseEntity<?> getMyProfile(@AuthenticationPrincipal CustomOAuth2UserDto userDetails) {
        UserDto userDto = userService.getUserProfile(userDetails.getId());
        return ResponseEntity.ok().body(userDto);
    }

    @PostMapping("/update-profile")
    public ResponseEntity<?> updateUserProfile(@AuthenticationPrincipal CustomOAuth2UserDto userDetails,
                                               @RequestParam("nickname") String nickname,
                                               @RequestParam(value = "profileImage", required = false) MultipartFile profileImage) {
        userService.updateUserProfile(userDetails.getId(), nickname, profileImage);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/my-point")
    public ResponseEntity<?> getMyPoint(@AuthenticationPrincipal CustomOAuth2UserDto userDetails) {
        return ResponseEntity.ok().body(userService.getMyPoint(userDetails.getId()));
    }

    @GetMapping("/my-point-history")
    public ResponseEntity<?> getMyPointHistory(@AuthenticationPrincipal CustomOAuth2UserDto userDetails) {
        return ResponseEntity.ok().body(userService.getMyPointHistory(userDetails.getId()));
    }

    @PutMapping("/notification-settings")
    public ResponseEntity<?> updateNotificationSettings(
            @AuthenticationPrincipal CustomOAuth2UserDto userDetails,
            @RequestParam boolean isNotificationEnabled
    ) {
        userService.updateNotificationSettings(userDetails.getId(), isNotificationEnabled);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/language")
    public ResponseEntity<Map<String, String>> getUserLanguage(@AuthenticationPrincipal CustomOAuth2UserDto userDetails) {
        String language = "EN"; // 기본값은 영어

        if (userDetails != null) {
            Users user = userRepository.findById(userDetails.getId()).orElse(null);
            if (user != null && user.getLanguage() != null) {
                language = user.getLanguage();
            }
        }

        return ResponseEntity.ok(Map.of("language", language));
    }

    @PutMapping("/language")
    public ResponseEntity<?> updateUserLanguage(
            @AuthenticationPrincipal CustomOAuth2UserDto userDetails,
            @RequestParam String language) {

        if (userDetails == null) {
            // 로그인하지 않은 경우 localStorage에만 저장하도록 프론트엔드에서 처리
            return ResponseEntity.ok().build();
        }

        Users user = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // language 필드만 업데이트
        user.updateLanguage(language);
        userRepository.save(user);

        return ResponseEntity.ok().build();
    }
}
