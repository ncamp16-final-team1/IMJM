package com.IMJM.archive.dto;

import lombok.*;
import java.time.OffsetDateTime;
import java.util.List;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ArchiveDetailDto {
    private Long id;
    private String userId;
    private String username;
    private String content;
    private String service;
    private String gender;
    private String color;
    private String length;
    private String profileUrl;
    private OffsetDateTime regDate;
    private List<String> photoUrls;
    private List<ArchiveCommentDto> comments;
    private long likeCount;
    private boolean isLiked;
}