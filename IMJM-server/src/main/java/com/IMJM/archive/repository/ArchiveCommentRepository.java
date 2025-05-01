package com.IMJM.archive.repository;

import com.IMJM.common.entity.Archive;
import com.IMJM.common.entity.ArchiveComment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ArchiveCommentRepository extends JpaRepository<ArchiveComment, Long> {

    // 특정 아카이브의 최상위 댓글만 조회 (대댓글 제외)
    @Query("SELECT ac FROM ArchiveComment ac WHERE ac.archive.id = :archiveId AND ac.isCommentForComment = false ORDER BY ac.regDate DESC")
    List<ArchiveComment> findRootCommentsByArchiveId(@Param("archiveId") Long archiveId);

    // 특정 댓글의 대댓글 조회
    @Query("SELECT ac FROM ArchiveComment ac WHERE ac.parentComment.id = :parentId ORDER BY ac.regDate ASC")
    List<ArchiveComment> findChildCommentsByParentId(@Param("parentId") Long parentId);
}