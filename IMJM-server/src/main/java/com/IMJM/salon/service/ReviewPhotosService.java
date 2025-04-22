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

    public List<String> getPhotoUrlsByReviewId(Long reviewId) {
        return reviewPhotosRepository.findByReview_IdOrderByPhotoOrderAsc(reviewId)
                .stream()
                .map(ReviewPhotos::getPhotoUrl)
                .collect(Collectors.toList());
    }

    public List<ReviewPhotosDto> getReviewPhotosByReviewId(Long reviewId) {
        return reviewPhotosRepository.findByReview_IdOrderByPhotoOrderAsc(reviewId)
                .stream()
                .map(photo -> ReviewPhotosDto.builder()
                        .photoId(photo.getPhotoId())
                        .photoUrl(photo.getPhotoUrl())
                        .photoOrder(photo.getPhotoOrder())
                        .uploadDate(photo.getUploadDate())
                        .build())
                .collect(Collectors.toList());
    }
}
