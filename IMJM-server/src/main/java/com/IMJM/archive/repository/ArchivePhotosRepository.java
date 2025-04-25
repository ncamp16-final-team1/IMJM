package com.IMJM.archive.repository;

import com.IMJM.common.entity.ArchivePhotos;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ArchivePhotosRepository extends JpaRepository<ArchivePhotos, Long> {
    List<ArchivePhotos> findByArchiveIdOrderByPhotoOrderAsc(Long archiveId);
}
