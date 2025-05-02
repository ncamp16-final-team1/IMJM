package com.IMJM.user.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
public class ReviewUpdateRequestDto {
    private String userId;
    private String salonId;
    private Long reservationId;
    private double rating;
    private String reviewText;
    private List<String> tags;



}
