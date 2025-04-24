package com.IMJM.salon.service;

import com.IMJM.common.entity.ReviewPhotos;
import com.IMJM.salon.dto.ReviewPhotosDto;
import com.IMJM.salon.repository.ReviewPhotosRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReviewPhotosService {

    private final ReviewPhotosRepository reviewPhotosRepository;

    public List<ReviewPhotosDto> getReviewPhotosByReviewId(Long reviewId) {
        return reviewPhotosRepository.findByReview_IdOrderByPhotoOrderAsc(reviewId)
                .stream()
                .map(ReviewPhotosDto::getReviewPhotos)
                .collect(Collectors.toList());
    }
}
