package com.IMJM.salon.repository;

import com.IMJM.common.entity.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    Page<Review> findBySalonId(String salonId, Pageable pageable);

    List<Review> findAllBySalonIdOrderByRegDateDesc(String salonId);
}