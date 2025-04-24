package com.IMJM.reservation.dto;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class UserPointDto {
    private String id;
    private Integer points;
}
