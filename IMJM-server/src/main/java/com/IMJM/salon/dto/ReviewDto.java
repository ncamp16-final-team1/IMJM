package com.IMJM.salon.dto;

import com.IMJM.common.entity.Review;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@NoArgsConstructor
public class ReviewDto {

    private Long id;
    private String userId;
    private String salonId;
    private LocalDateTime regDate;
    private BigDecimal score;
    private String content;
    private String reviewTag;
    private Long reservationId;
    private String userNickname;

    @Builder
    public ReviewDto (Review review){
        this.id = review.getId();
        this.userId = review.getUser() != null ? review.getUser().getId() : null;
        this.salonId = review.getSalon() != null ? review.getSalon().getId() : null;
        this.regDate = review.getRegDate();
        this.score = review.getScore();
        this.content = review.getContent();
        this.reviewTag = review.getReviewTag();
        this.reservationId = review.getReservation() != null ? review.getReservation().getId() : null;
        this.userNickname = review.getUser().getNickname();
    }
}
