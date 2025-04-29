package com.IMJM.user.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;


@Getter
@NoArgsConstructor
public class UserReviewResponseDto {
    private Long reviewId;
    private String userId;
    private Long reservationId;
    private String reviewContent;
    private BigDecimal score;
    private LocalDateTime regDate;
    private List<String> reviewTags;
    private List<String> reviewPhotoUrls;

    public UserReviewResponseDto(Long reviewId, String userId, Long reservationId,
                                 String reviewContent, BigDecimal score, LocalDateTime regDate,
                                 List<String> reviewTags, List<String> reviewPhotoUrls) {
        this.reviewId = reviewId;
        this.userId = userId;
        this.reservationId = reservationId;
        this.reviewContent = reviewContent;
        this.score = score;
        this.regDate = regDate;
        this.reviewTags = reviewTags;
        this.reviewPhotoUrls = reviewPhotoUrls;
    }

}
