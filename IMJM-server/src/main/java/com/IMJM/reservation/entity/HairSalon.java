package com.IMJM.reservation.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

/**
 * 헤어 살롱 정보를 표현하는 엔티티 클래스입니다.
 * hair_salon 테이블과 매핑됩니다.
 */
@Entity
@Table(name = "hair_salon")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class HairSalon {

    @Id
    @Column(length = 20)
    private String id;

    @Column(nullable = false, length = 100)
    private String password;

    @Column(nullable = false, length = 30)
    private String name;

    @Column(name = "corp_reg_number", length = 20)
    private String corpRegNumber;

    private String address;

    @Column(name = "call_number", length = 20)
    private String callNumber;

    @Column(columnDefinition = "TEXT")
    private String introduction;

    @Column(name = "holiday_mask", nullable = false)
    private short holidayMask = 0;

    @Column(name = "start_time")
    private LocalTime startTime;

    @Column(name = "end_time")
    private LocalTime endTime;

    @Column(name = "time_unit")
    private Integer timeUnit;

    @Column(precision = 2, scale = 1)
    private BigDecimal score;

    @Column(precision = 10, scale = 8)
    private BigDecimal latitude;

    @Column(precision = 11, scale = 8)
    private BigDecimal longitude;

    /**
     * 이 살롱에 소속된 스타일리스트 목록
     */
    @OneToMany(mappedBy = "hairSalon", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<AdminStylist> stylist = new ArrayList<>();

    /**
     * 이 살롱의 사진 목록
     */
    @OneToMany(mappedBy = "hairSalon", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<HairSalonPhotos> photos = new ArrayList<>();

    /**
     * 빌더 패턴을 사용한 객체 생성
     */
    @Builder
    public HairSalon(String id, String password, String name, String corpRegNumber,
                     String address, String callNumber, String introduction,
                     Short holidayMask, LocalTime startTime, LocalTime endTime,
                     Integer timeUnit, BigDecimal score,
                     BigDecimal latitude, BigDecimal longitude) {
        this.id = id;                       // 살롱의 고유 식별자
        this.password = password;           // 살롱 계정 비밀번호 (암호화된 상태로 저장)
        this.name = name;                   // 살롱 이름
        this.corpRegNumber = corpRegNumber; // 사업자 등록 번호
        this.address = address;             // 살롱 주소
        this.callNumber = callNumber;       // 연락처 전화번호
        this.introduction = introduction;   // 살롱 소개글
        this.holidayMask = holidayMask != null ? holidayMask : 0;   //휴무일 비트 마스크 (null일 경우 0으로 기본값 설정)
        this.startTime = startTime;         // 영업 시작 시간
        this.endTime = endTime;             // 영업 종료 시간
        this.timeUnit = timeUnit;           // 예약 시간 단위 (30분 단위/1시간 단위)
        this.score = score;                 // 평점
        this.latitude = latitude;           // 위도 좌표
        this.longitude = longitude;         // 경도 좌표
    }
}