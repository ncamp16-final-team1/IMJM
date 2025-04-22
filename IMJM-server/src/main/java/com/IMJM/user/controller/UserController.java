package com.IMJM.user.controller;

import com.IMJM.common.entity.Users;
import com.IMJM.jwt.JWTUtil;
import com.IMJM.user.dto.CustomOAuth2UserDto;
import com.IMJM.user.dto.UserDto;
import com.IMJM.user.repository.UserRepository;
import com.IMJM.user.service.UserService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.apache.catalina.User;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/user")
public class UserController {

    private final UserService userService;
    private final JWTUtil jwtUtil;
    private final UserRepository userRepository;

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

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser() {
        // 현재 인증된 사용자의 ID 가져오기
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();
        System.out.println("Current User ID: " + userId);
        System.out.println("Authentication: " + SecurityContextHolder.getContext().getAuthentication());

        // 로그인하지 않은 사용자 처리
        if ("anonymousUser".equals(userId)) {
            UserDto guestDto = new UserDto();
            guestDto.setId("guest");
            guestDto.setFirstName("게스트");
            guestDto.setLatitude(37.498297);
            guestDto.setLongitude(127.027733);
            return ResponseEntity.ok(guestDto);
        }

        try {
            Users user = userRepository.findById(userId)
                    .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사용자"));

            UserDto userDto = userService.convertToDto(user);

            userDto.setLatitude(37.498297);
            userDto.setLongitude(127.027733);

            return ResponseEntity.ok(userDto);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("인증되지 않은 사용자");
        }
    }

}
