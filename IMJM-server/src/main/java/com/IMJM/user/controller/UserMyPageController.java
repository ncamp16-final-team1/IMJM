package com.IMJM.user.controller;

import com.IMJM.user.dto.*;
import com.IMJM.user.dto.CustomOAuth2UserDto;
import com.IMJM.user.dto.ReservationDetailResponseDto;
import com.IMJM.user.dto.ReviewSaveRequestDto;
import com.IMJM.user.dto.UserReservationResponseDto;
import com.IMJM.user.service.MyPageService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;


@RestController
@RequiredArgsConstructor
@RequestMapping("/api/mypages")
@Slf4j
public class UserMyPageController {

    private final MyPageService myPageService;

    // 예약리스트 조회
    @GetMapping("/reservations")
    public ResponseEntity<List<UserReservationResponseDto>> getUserReservations(
            @AuthenticationPrincipal CustomOAuth2UserDto customOAuth2UserDto) {

        String userId = customOAuth2UserDto.getId();
        List<UserReservationResponseDto> reservations = myPageService.getUserReservations(userId);
        return ResponseEntity.ok(reservations);
    }

    // 리뷰 작성
    @PostMapping(value = "/review-save", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> saveUserReview(
            @RequestPart("reviewData") ReviewSaveRequestDto reviewSaveRequestDto,
            @RequestPart(value = "images", required = false) List<MultipartFile> images,
            @AuthenticationPrincipal CustomOAuth2UserDto oAuth2UserDto) {

        try {
            String userId = oAuth2UserDto.getId();
            reviewSaveRequestDto.setUserId(userId);

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


    @PatchMapping(value = "/review-update/{reviewId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> updateUserReview(
            @PathVariable Long reviewId,
            @RequestPart("reviewData") ReviewUpdateRequestDto reviewUpdateRequestDto,
            @RequestPart(value = "images", required = false) List<MultipartFile> images,
            @RequestPart(value = "imagesToDelete", required = false) List<String> imagesToDelete,
            @AuthenticationPrincipal CustomOAuth2UserDto oAuth2UserDto) {

        try {

            Long updatedReviewId = myPageService.updateReview(reviewId, reviewUpdateRequestDto, images, imagesToDelete);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "리뷰가 성공적으로 수정되었습니다.");
            response.put("reviewId", updatedReviewId);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            // 예외 로깅
            log.error("리뷰 수정 중 오류 발생: {}", e.getMessage(), e);

            // 에러 타입에 따른 응답 생성
            HttpStatus status = HttpStatus.INTERNAL_SERVER_ERROR;
            String message = "리뷰 수정 중 오류가 발생했습니다";

            if (e instanceof AccessDeniedException) {
                status = HttpStatus.FORBIDDEN;
                message = "리뷰 수정 권한이 없습니다";
            } else if (e instanceof EntityNotFoundException) {
                status = HttpStatus.NOT_FOUND;
                message = "리뷰를 찾을 수 없습니다";
            }

            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", message + ": " + e.getMessage());

            return ResponseEntity.status(status).body(errorResponse);
        }
    }

    @GetMapping("/view-review")
    public ResponseEntity<?> getUserReview(@RequestParam("reviewId") Long reviewId,
                                           @AuthenticationPrincipal CustomOAuth2UserDto customOAuth2UserDto) {

        String userId = customOAuth2UserDto.getId();

        if (userId == null || userId.isEmpty()) {
            return ResponseEntity.badRequest().body("유저 ID가 유효하지 않습니다.");
        }

        try {
            UserReviewResponseDto reviewResponseDto = myPageService.getReviewWithPhotos(reviewId);
            return ResponseEntity.ok(reviewResponseDto);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("리뷰를 찾을 수 없습니다.");
        }
    }

    @GetMapping("/view-review-reply")
    public ResponseEntity<?> getUserReviewReply(@RequestParam("reviewId") Long reviewId,
                                                @AuthenticationPrincipal CustomOAuth2UserDto customOAuth2UserDto) {

        String userId = customOAuth2UserDto.getId();

        if (userId == null || userId.isEmpty()) {
            return ResponseEntity.badRequest().body("유저 ID가 유효하지 않습니다.");
        }
        try {
            UserReviewReplyResponseDto replyResponseDto = myPageService.getReviewReplyByReviewId(reviewId);

            if (replyResponseDto == null) {
                return ResponseEntity.ok(null);
            }
            return ResponseEntity.ok(replyResponseDto);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("서버 오류가 발생했습니다.");
        }
    }


    // 예약 상세조회
    @GetMapping("/reservations/{reservationId}")
    public ResponseEntity<ReservationDetailResponseDto> getReservationDetail(@PathVariable Long reservationId) {

        ReservationDetailResponseDto responseDto = myPageService.getReservationDetail(reservationId);
        return ResponseEntity.ok(responseDto);
    }
}
