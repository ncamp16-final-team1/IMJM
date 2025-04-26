package com.IMJM.user.controller;

import com.IMJM.salon.dto.ReviewDto;
import com.IMJM.user.dto.CustomOAuth2UserDto;
import com.IMJM.user.dto.ReviewSaveRequestDto;
import com.IMJM.user.dto.UserReservationResponseDto;
import com.IMJM.user.service.MyPageService;
import com.fasterxml.jackson.core.ObjectCodec;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;


@RestController
@RequiredArgsConstructor
@RequestMapping("/api/myPages")
@Slf4j
public class UserMyPageController {

    private final MyPageService myPageService;

    // 예약리스트 조회
    @GetMapping("/reservations")
    public ResponseEntity<List<UserReservationResponseDto>> getUserReservations(
            @AuthenticationPrincipal CustomOAuth2UserDto customOAuth2UserDto
    ) {

        String userId = customOAuth2UserDto.getId();

        List<UserReservationResponseDto> reservations = myPageService.getUserReservations(userId);
        return ResponseEntity.ok(reservations);
    }

    // 리뷰 작성
    @PostMapping(value = "/review-save", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> saveUserReview(
            @RequestPart("reviewData") ReviewSaveRequestDto reviewSaveRequestDto,
            @RequestPart(value = "image0", required = false) MultipartFile image0,
            @RequestPart(value = "image1", required = false) MultipartFile image1,
            @RequestPart(value = "image2", required = false) MultipartFile image2,
            @AuthenticationPrincipal CustomOAuth2UserDto oAuth2UserDto) {

        try {
            String userId = oAuth2UserDto.getId();

            reviewSaveRequestDto.setUserId(userId);

            List<MultipartFile> images = new ArrayList<>();
            if (image0 != null && !image0.isEmpty()) images.add(image0);
            if (image1 != null && !image1.isEmpty()) images.add(image1);
            if (image2 != null && !image2.isEmpty()) images.add(image2);

            Long reviewId = myPageService.saveReview(reviewSaveRequestDto, images);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "리뷰가 성공적으로 저장되었습니다.");
            response.put("reviewId", reviewId);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("리뷰 저장 중 오류 발생", e);

            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "리뷰 저장 중 오류가 발생했습니다: " + e.getMessage());

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
}
