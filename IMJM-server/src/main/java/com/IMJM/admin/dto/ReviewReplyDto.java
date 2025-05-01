package com.IMJM.admin.dto;

import lombok.*;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ReviewReplyDto {
    private Long reviewId;
    private String content;
}
