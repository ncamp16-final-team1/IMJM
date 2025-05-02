package com.IMJM.archive.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ArchiveListDto {
    private Long id;
    private String content;
    private LocalDateTime regDate;
    private String thumbnailUrl;
    private String userId;
}
