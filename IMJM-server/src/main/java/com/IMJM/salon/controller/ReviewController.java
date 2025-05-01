package com.IMJM.salon.controller;

import com.IMJM.common.page.PageResponseDto;
import com.IMJM.salon.dto.ReviewDto;
import com.IMJM.salon.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @GetMapping("/salon/{salonId}/reviews")
    public ResponseEntity<?> getSalonReviews(
            @PathVariable String salonId,
            @PageableDefault(sort = "regDate", direction = Sort.Direction.DESC) Pageable pageable) {
        PageResponseDto<ReviewDto> reviews = reviewService.getSalonReviews(salonId, pageable);// ctrl + alt + v(반환변수 생성), ctrl + alt + o(import안쓰는거 제거)
        return ResponseEntity.ok(reviews);
    }
}