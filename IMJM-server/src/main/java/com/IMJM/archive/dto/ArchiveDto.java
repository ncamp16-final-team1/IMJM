package com.IMJM.archive.dto;

import lombok.*;

import java.time.OffsetDateTime;
import java.util.List;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ArchiveDto {
    private Long id;
    private String userId;
    private String username;
    private String profileUrl;
    private String content;
    private String service;
    private String gender;
    private String color;
    private String length;
    private OffsetDateTime regDate;
    private List<String> photoUrls;
}
