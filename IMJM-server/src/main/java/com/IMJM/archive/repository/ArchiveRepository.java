package com.IMJM.archive.repository;

import com.IMJM.common.entity.Archive;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface ArchiveRepository extends JpaRepository<Archive, Long> {

    void deleteById(Long id);

    @Query("SELECT a " +
            "FROM Archive a " +
            "LEFT JOIN ArchiveLike al ON a.id = al.archive.id " +
            "GROUP BY a.id " +
            "ORDER BY COUNT(al) DESC")
    Page<Archive> findTopByLikesCount(Pageable pageable);
}