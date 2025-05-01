package com.IMJM.user.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
public class ReviewSaveRequestDto {
    private String userId;
    private String salonId;
    private Double rating;
    private String reviewText;
    private List<String> tags;
    private Long reservationId;
}
