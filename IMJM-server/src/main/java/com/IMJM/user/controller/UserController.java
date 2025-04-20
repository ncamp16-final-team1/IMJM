package com.IMJM.user.controller;

import com.IMJM.common.entity.Users;
import com.IMJM.user.dto.CustomOAuth2UserDto;
import com.IMJM.user.dto.UserDto;
import com.IMJM.user.repository.UserRepository;
import com.IMJM.user.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class UserController {

    private final UserService userService;
    private final UserRepository userRepository;

    public UserController(UserService userService, UserRepository userRepository) {
        this.userService = userService;
        this.userRepository = userRepository;
    }

    @PostMapping("/api/user/register")
    public ResponseEntity<?> registerUser(@RequestBody UserDto dto,
                                          @AuthenticationPrincipal CustomOAuth2UserDto userDto) {
        if(dto.getUserType().equals("MEMBER")) {
            userService.completeRegistration(dto);
        }
        String userId = userDto.getId();
        return ResponseEntity.ok("회원가입 완료");
    }

    @GetMapping("/api/user")
    public String mainAPI() {
        return "user route";
    }

    @GetMapping("/api/my")
    public String myAPI() {
        return "my route";
    }

    @GetMapping("/api/user/me")
    public ResponseEntity<?> getCurrentUser() {
        // 현재 인증된 사용자의 ID 가져오기
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();

        // 로그인하지 않은 사용자 처리
        if ("anonymousUser".equals(userId)) {
            UserDto guestDto = new UserDto();
            guestDto.setId("guest");
            guestDto.setFirstName("게스트");
            guestDto.setLatitude(37.5665);
            guestDto.setLongitude(126.9780);
            return ResponseEntity.ok(guestDto);
        }

        try {
            // 사용자 정보 조회
            Users user = userRepository.findById(userId)
                    .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사용자"));

            // UserService를 통해 DTO 변환 로직을 처리
            UserDto userDto = userService.convertToDto(user);

            // 위치 정보 추가
            userDto.setLatitude(37.5665);
            userDto.setLongitude(126.9780);

            return ResponseEntity.ok(userDto);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("인증되지 않은 사용자");
        }
    }

}
