package com.IMJM.admin.dto;

import lombok.*;

import java.time.OffsetDateTime;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AdminReviewDto {
    private Long reviewId;
    private String nickName;
    private String userName;
    private OffsetDateTime regDate;
    private Boolean answered;
}
