package com.IMJM.user.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
@AllArgsConstructor
public class PointHistoryResponseDto {
    private String usageType;
    private int price;
    private String useDate;
    private String content;
}
