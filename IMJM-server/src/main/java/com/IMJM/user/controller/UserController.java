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
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

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
        try {
            UserDto userDto = userService.getUserLocation(userDetails.getId());
            return ResponseEntity.ok(userDto);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("인증되지 않은 사용자");
        }
    }

}
