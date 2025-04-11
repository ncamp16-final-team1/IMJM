package com.IMJM.reservation.dto;

import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalTime;

@Getter
@NoArgsConstructor
public class ReservationSalonDto {
    private String id;               // 매장 고유 ID
    private String password;         // 매장 비밀번호
    private String name;             // 매장 이름
    private String corpRegNumber;    // 사업자 등록 번호
    private String address;          // 매장 주소
    private String callNumber;       // 매장 연락처
    private String introduction;     // 매장 소개
    private short holidayMask;       // 매장 휴무일 설정 (비트마스크)
    private LocalTime startTime;     // 매장 운영 시작 시간
    private LocalTime endTime;       // 매장 운영 종료 시간
    private int timeUnit;            // 시간 단위 (예: 예약 시간 간격)
    private BigDecimal score;             // 매장 평점
    private BigDecimal latitude;         // 매장 위도
    private BigDecimal longitude;        // 매장 경도

    @Builder
    public ReservationSalonDto(String id, String password, String name, String corpRegNumber,
                               String address, String callNumber, String introduction, short holidayMask,
                               LocalTime startTime, LocalTime endTime, int timeUnit, BigDecimal score,
                               BigDecimal latitude, BigDecimal longitude) {
        this.id = id;
        this.password = password;
        this.name = name;
        this.corpRegNumber = corpRegNumber;
        this.address = address;
        this.callNumber = callNumber;
        this.introduction = introduction;
        this.holidayMask = holidayMask;
        this.startTime = startTime;
        this.endTime = endTime;
        this.timeUnit = timeUnit;
        this.score = score;
        this.latitude = latitude;
        this.longitude = longitude;
    }




}
