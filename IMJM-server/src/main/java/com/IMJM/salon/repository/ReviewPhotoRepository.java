package com.IMJM.salon.repository;

import com.IMJM.common.entity.ReviewPhotos;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ReviewPhotoRepository extends JpaRepository<ReviewPhotos, Long> {
}
