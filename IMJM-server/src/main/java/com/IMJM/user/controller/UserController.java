package com.IMJM.user.controller;

import com.IMJM.user.dto.CustomOAuth2UserDto;
import com.IMJM.user.dto.UserDto;
import com.IMJM.user.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/user")
public class UserController {

    private final UserService userService;

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
    public ResponseEntity<?> getUserLocation() {
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();
        try {
            UserDto userDto = userService.getUserLocation(userId);
            return ResponseEntity.ok(userDto);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("인증되지 않은 사용자");
        }
    }

}
