package com.IMJM.salon.service;

import com.IMJM.common.entity.Review;
import com.IMJM.salon.dto.ReviewDto;
import com.IMJM.salon.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;

    public List<ReviewDto> getSalonReviews(String salonId) {
        List<Review> reviews = reviewRepository.findBySalonId(salonId);
        return reviews.stream()
                .map(ReviewDto::new)
                .collect(Collectors.toList());
    }
}
