package com.IMJM.archive.dto;

import lombok.*;

import java.util.List;
import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ArchiveUpdateRequest {
    private String content;
    private List<Long> deletePhotoIds; // 삭제할 사진 ID 목록
    private Map<Long, Integer> photoOrders; // 사진 ID와 순서
}