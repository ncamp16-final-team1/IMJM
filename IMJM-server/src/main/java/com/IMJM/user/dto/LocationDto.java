package com.IMJM.user.dto;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LocationDto {
    private String userId;
    private BigDecimal latitude;
    private BigDecimal longitude;
}
