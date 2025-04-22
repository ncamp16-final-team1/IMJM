package com.IMJM.salon.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ReviewPhotosDto {

    private Long photoId;
    private String photoUrl;
    private int photoOrder;
    private LocalDateTime uploadDate;

}
