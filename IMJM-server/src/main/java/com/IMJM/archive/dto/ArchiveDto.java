package com.IMJM.archive.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ArchiveDto {

    private Long id;
    private String userid;
    private String content;
    private String service;
    private String gender;
    private String color;
    private String length;
    private LocalDateTime regDate;

}
