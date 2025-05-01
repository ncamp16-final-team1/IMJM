package com.IMJM.archive.repository;

import com.IMJM.common.entity.ArchivePhotos;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ArchivePhotosRepository extends JpaRepository<ArchivePhotos, Long> {

    @Query("SELECT ap FROM ArchivePhotos ap WHERE ap.archive.id = :archiveId AND ap.photoOrder = (SELECT MIN(p.photoOrder) FROM ArchivePhotos p WHERE p.archive.id = :archiveId)")
    ArchivePhotos findFirstPhotoByArchiveId(@Param("archiveId") Long archiveId);

    List<ArchivePhotos> findByArchiveIdOrderByPhotoOrderAsc(Long archiveId);

    void deleteByArchiveId(Long archiveId);
}