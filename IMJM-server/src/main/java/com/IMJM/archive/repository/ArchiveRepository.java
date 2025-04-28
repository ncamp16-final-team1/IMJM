package com.IMJM.archive.repository;

import com.IMJM.common.entity.Archive;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface ArchiveRepository extends JpaRepository<Archive, Long> {

    @Query("SELECT a, (SELECT ap.photoUrl FROM ArchivePhotos ap WHERE ap.archive.id = a.id AND ap.photoOrder = (SELECT MIN(p.photoOrder) FROM ArchivePhotos p WHERE p.archive.id = a.id)) FROM Archive a")
    Page<Object[]> findAllWithFirstPhoto(Pageable pageable);
}