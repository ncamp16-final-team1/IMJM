package com.IMJM.archive.repository;

import com.IMJM.common.entity.Archive;
import com.IMJM.common.entity.ArchivePhotos;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ArchivePhotosRepository extends JpaRepository<ArchivePhotos, Long> {
    List<ArchivePhotos> findByArchiveOrderByPhotoOrderAsc(Archive archive);

    // 아카이브 ID로 첫 번째 사진 찾기 (photoOrder가 가장 작은 사진)
    @Query("SELECT ap FROM ArchivePhotos ap WHERE ap.archive.id = :archiveId AND ap.photoOrder = (SELECT MIN(p.photoOrder) FROM ArchivePhotos p WHERE p.archive.id = :archiveId)")
    ArchivePhotos findFirstPhotoByArchiveId(@Param("archiveId") Long archiveId);

    // 또는 단순히 아카이브 ID와 특정 photoOrder로 조회
    ArchivePhotos findByArchiveIdAndPhotoOrder(Long archiveId, int photoOrder);
}