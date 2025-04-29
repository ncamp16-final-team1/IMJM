package com.IMJM.admin.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AdminReviewDto {
    private Long reviewId;
    private String userName;
    private LocalDateTime regDate;
    private Boolean answered;
}
