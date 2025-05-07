package com.IMJM.salon.controller;

import com.IMJM.common.page.PageResponseDto;
import com.IMJM.salon.dto.ReviewDto;
import com.IMJM.salon.service.ReviewService;
import com.IMJM.user.dto.UserReviewReplyResponseDto;
import com.IMJM.user.service.MyPageService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;
    private final MyPageService myPageService;

    @GetMapping("/salon/{salonId}/reviews")
    public ResponseEntity<?> getSalonReviews(
            @PathVariable String salonId,
            @PageableDefault(sort = "regDate", direction = Sort.Direction.DESC) Pageable pageable) {
        PageResponseDto<ReviewDto> reviews = reviewService.getSalonReviews(salonId, pageable);
        return ResponseEntity.ok(reviews);
    }

    @GetMapping("/review-reply")
    public ResponseEntity<?> getReviewReply(@RequestParam("reviewId") Long reviewId) {
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
}