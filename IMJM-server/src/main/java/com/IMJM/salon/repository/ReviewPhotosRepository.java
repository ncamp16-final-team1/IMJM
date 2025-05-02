package com.IMJM.salon.repository;

import com.IMJM.common.entity.ReviewPhotos;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ReviewPhotosRepository extends JpaRepository<ReviewPhotos, Long> {

    List<ReviewPhotos> findByReview_IdOrderByPhotoOrderAsc(Long reviewId);

    List<ReviewPhotos> findByReviewId(Long reviewId);

    Optional<ReviewPhotos> findByReviewIdAndPhotoUrl(Long reviewId, String photoUrl);
}
