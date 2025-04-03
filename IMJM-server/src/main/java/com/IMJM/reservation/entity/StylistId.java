package com.IMJM.reservation.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Embeddable     // JPA에게 이 클래스가 엔티티의 일부로 포함될 수 있는 컴포넌트임을 알림
@Getter
@NoArgsConstructor // 파라미터 없는 기본 생성자 자동 생성
@AllArgsConstructor //모든 필드를 파라미터로 받는 생성자를 자동 생성
@EqualsAndHashCode  // equals와 hashCode 메소드를 자동 생성(복합키 비교에 필요)
public class StylistId implements Serializable {

    // 복합키 첫번째 부분
    @Column(name = "salon_id", length = 20)
    private  String salonId;

    @Column(name = "stylist_id", length = 10)
    private String stylistId;

}
