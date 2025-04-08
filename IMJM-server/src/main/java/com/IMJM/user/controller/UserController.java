package com.IMJM.user.controller;

import com.IMJM.user.dto.UserDto;
import com.IMJM.user.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/user/register")
    public ResponseEntity<?> registerUser(@RequestBody UserDto dto) {
//        String userId = SecurityContextHolder.getContext().getAuthentication().getName();
//        dto.setId(userId);
        userService.completeRegistration(dto);
        return ResponseEntity.ok("회원가입 완료");
    }

    @GetMapping("/user")
    public String mainAPI() {
        return "user route";
    }

    @GetMapping("/my")
    public String myAPI() {
        return "my route";
    }
}
