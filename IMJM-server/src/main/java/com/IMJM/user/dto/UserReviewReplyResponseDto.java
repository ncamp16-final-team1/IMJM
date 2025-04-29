package com.IMJM.user.dto;


import com.IMJM.common.entity.ReviewReply;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class UserReviewReplyResponseDto {
    private Long id;
    private Long reviewId;
    private String content;
    private LocalDateTime createdAt;

    public UserReviewReplyResponseDto(ReviewReply reviewReply) {
        this.id = reviewReply.getId();
        this.reviewId = reviewReply.getReview().getId();
        this.content = reviewReply.getContent();
        this.createdAt = reviewReply.getCreatedAt();
    }
}
