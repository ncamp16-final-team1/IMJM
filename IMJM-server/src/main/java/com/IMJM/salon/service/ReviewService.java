package com.IMJM.salon.service;

import com.IMJM.common.page.PageResponseDto;
import com.IMJM.common.entity.Review;
import com.IMJM.salon.dto.ReviewDto;
import com.IMJM.salon.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;

    public PageResponseDto<ReviewDto> getSalonReviews(String salonId, Pageable pageable) {
        Page<Review> reviewPage = reviewRepository.findBySalonId(salonId, pageable);
        List<ReviewDto> reviewDtos =  reviewPage.getContent().stream()
                .map(ReviewDto::new)
                .toList();
        return new PageResponseDto<>(reviewDtos, reviewPage);
    }
}