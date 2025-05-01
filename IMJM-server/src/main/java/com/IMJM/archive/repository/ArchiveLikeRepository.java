package com.IMJM.archive.repository;

import com.IMJM.common.entity.Archive;
import com.IMJM.common.entity.ArchiveLike;
import com.IMJM.common.entity.ArchiveLikeId;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ArchiveLikeRepository extends JpaRepository<ArchiveLike, ArchiveLikeId> {

    long countByArchiveId(Long archiveId);

    List<ArchiveLike> findByArchiveId(Long archiveId);

    Optional<ArchiveLike> findByArchiveIdAndUserId(Long archiveId, String userId);

    boolean existsByArchiveIdAndUserId(Long archiveId, String userId);
}