package com.IMJM.reservation.dto;

import lombok.*;

@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PopularSalonDto {
    private String id;
    private String name;
    private String address;
    private Double score;
    private Long reservationCount;
    private String photoUrl;
}
