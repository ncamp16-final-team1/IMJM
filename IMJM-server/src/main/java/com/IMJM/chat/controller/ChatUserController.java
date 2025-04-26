package com.IMJM.chat.controller;

import com.IMJM.user.dto.CustomOAuth2UserDto;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/chat/user")
public class ChatUserController {

    @GetMapping("/current")
    public ResponseEntity<Map<String, Object>> getCurrentUser(@AuthenticationPrincipal CustomOAuth2UserDto userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Not authenticated"));
        }

        Map<String, Object> userInfo = new HashMap<>();
        userInfo.put("id", userDetails.getId());
        userInfo.put("email", userDetails.getEmail());
        userInfo.put("firstName", userDetails.getFirstName());
        userInfo.put("lastName", userDetails.getLastName());
        userInfo.put("language", userDetails.getUser().getLanguage());
        userInfo.put("nickname", userDetails.getUser().getNickname());

        return ResponseEntity.ok(userInfo);
    }
}