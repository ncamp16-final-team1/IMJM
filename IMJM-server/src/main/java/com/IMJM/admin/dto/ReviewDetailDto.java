package com.IMJM.admin.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReviewDetailDto {
    private Long id;
    private String userName;        // 고객 이름
    private String stylistName;         // 스타일리스트 이름
    private LocalDate visitDate;        // 방문일
    private LocalTime visitTime;        // 방문 시간
    private String serviceName;         // 스타일 메뉴
    private BigDecimal score;           // 별점
    private String content;             // 리뷰 내용
    private String reviewTag;           // 리뷰 태그
    private List<String> photoUrls;     // 리뷰 사진 (0~여러개)
    private String reviewReply;
}
