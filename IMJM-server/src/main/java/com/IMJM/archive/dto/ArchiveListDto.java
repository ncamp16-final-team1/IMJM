package com.IMJM.archive.dto;

import lombok.*;

import java.time.OffsetDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ArchiveListDto {
    private Long id;
    private String content;
    private OffsetDateTime regDate;
    private String thumbnailUrl;
    private String userId;
}
