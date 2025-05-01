package com.IMJM.salon.repository;

import com.IMJM.common.entity.ReviewPhotos;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReviewPhotosRepository extends JpaRepository<ReviewPhotos, Long> {

    List<ReviewPhotos> findByReview_IdOrderByPhotoOrderAsc(Long reviewId);

    List<ReviewPhotos> findByReviewId(Long reviewId);
}
