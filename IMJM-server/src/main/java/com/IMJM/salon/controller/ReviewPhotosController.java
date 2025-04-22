package com.IMJM.salon.controller;

import com.IMJM.salon.dto.ReviewPhotosDto;
import com.IMJM.salon.service.ReviewPhotosService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ReviewPhotosController {

    private final ReviewPhotosService reviewPhotosService;

    @GetMapping("/review/{reviewId}/photos")
    public ResponseEntity<List<ReviewPhotosDto>> getReviewPhotos(@PathVariable Long reviewId) {
        List<ReviewPhotosDto> photos = reviewPhotosService.getReviewPhotosByReviewId(reviewId);
        return ResponseEntity.ok(photos);
    }
}
