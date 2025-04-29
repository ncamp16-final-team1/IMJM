package com.IMJM.admin.repository;

import com.IMJM.common.entity.ReviewReply;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReviewReplyRepository extends JpaRepository<ReviewReply, Long> {
    ReviewReply findByReviewId(Long reviewId);

    void deleteByReviewId(Long reviewId);
}
