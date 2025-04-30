package com.IMJM.salon.repository;

import com.IMJM.common.entity.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    Page<Review> findBySalonId(String salonId, Pageable pageable);

    @Query("SELECT r FROM Review r WHERE r.id = :reviewId")
    Optional<Review> findByReviewId(@Param("reviewId") Long reviewId);

    List<Review> findAllBySalonIdOrderByRegDateDesc(String salonId);
}