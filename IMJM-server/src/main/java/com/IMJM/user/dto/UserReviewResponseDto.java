package com.IMJM.user.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;


@Getter
@NoArgsConstructor
@Builder
public class UserReviewDetailDto {
    private Long reviewId;
    private String userId;
    private Long reservationId;
    private BigDecimal score;
    private LocalDateTime regDate;
    private List<String> reviewTags;
    private List<String> reviewPhotoUrls;


}
