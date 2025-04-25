package com.IMJM.user.controller;

import com.IMJM.user.dto.CustomOAuth2UserDto;
import com.IMJM.user.dto.UserReservationResponseDto;
import com.IMJM.user.service.MyPageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;


@RestController
@RequiredArgsConstructor
@RequestMapping("/api/myPages")
public class UserMyPageController {

    private final MyPageService myPageService;

    @GetMapping("/reservations")
    public ResponseEntity<List<UserReservationResponseDto>> getUserReservations(
            @AuthenticationPrincipal CustomOAuth2UserDto customOAuth2UserDto) {

        String userId = customOAuth2UserDto.getId();
        // 서비스에서 예약 정보를 가져옴
        List<UserReservationResponseDto> reservations = myPageService.getUserReservations(userId);
        return ResponseEntity.ok(reservations);
    }
}
