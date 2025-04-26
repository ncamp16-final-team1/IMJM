package com.IMJM.salon.repository;

import com.IMJM.common.entity.ReviewPhotos;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReviewPhotoRepository extends JpaRepository<ReviewPhotos, Long> {
}
