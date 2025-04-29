package com.IMJM.admin.controller;

import com.IMJM.admin.dto.CustomSalonDetails;
import com.IMJM.admin.dto.ReviewDetailDto;
import com.IMJM.admin.dto.ReviewReplyDto;
import com.IMJM.admin.service.AdminReviewService;
import com.IMJM.common.entity.ReviewReply;
import com.IMJM.salon.dto.ReviewDto;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/review")
@RequiredArgsConstructor
public class AdminReviewController {

    private final AdminReviewService adminReviewService;

    @GetMapping("/list")
    public ResponseEntity<?> getReviewList(@AuthenticationPrincipal CustomSalonDetails salonDetails) {
        return ResponseEntity.ok(adminReviewService.getReviewList(salonDetails.getSalonId()));
    }

    @PostMapping("/reply")
    public ResponseEntity<?> reviewReply(@RequestBody ReviewReplyDto reviewReplyDto) {
        adminReviewService.reviewReply(reviewReplyDto.getReviewId(), reviewReplyDto.getContent());
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{reviewId}")
    public ResponseEntity<?> getReviewDetail(@PathVariable Long reviewId) {
        ReviewDetailDto reviewDetailDto = adminReviewService.getReviewDetail(reviewId);
        return ResponseEntity.ok(reviewDetailDto);
    }

    @PutMapping("/reply")
    public ResponseEntity<?> updateReviewReply(@RequestBody ReviewReplyDto reviewReplyDto) {
        adminReviewService.updateReviewReply(reviewReplyDto);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/reply/{reviewId}")
    public ResponseEntity<?> deleteReviewReply(@PathVariable Long reviewId) {
        adminReviewService.deleteReviewReply(reviewId);
        return ResponseEntity.ok().build();
    }
}
