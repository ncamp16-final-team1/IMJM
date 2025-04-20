package com.IMJM.salon.controller;

import com.IMJM.salon.dto.ReviewDto;
import com.IMJM.salon.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @GetMapping("/salons/{salonId}/reviews")
    public ResponseEntity<List<ReviewDto>> getSalonReviews(@PathVariable String salonId) {
        List<ReviewDto> reviews = reviewService.getSalonReviews(salonId);
        return ResponseEntity.ok(reviews);
    }

}