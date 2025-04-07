package com.IMJM.reservation.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalTime;

@Entity
@Table(name = "admin_stylist")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)  // jpa에 필요한 기본 생성자를 protected 로 생성.
public class AdminStylist {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "stylist_id")
    private Integer stylistId;

    @Column(nullable = false, length = 10)
    private String name;

    @Column(name = "call_number")
    private String callNumber;

    @Column(name = "start_time")
    private LocalTime startTime;

    @Column(name = "end_time")
    private LocalTime endTime;

    @Column(name = "holiday_mask", nullable = false)
    private short holidayMask = 0;

    @Column(columnDefinition = "TEXT")
    private String introduction;

    @Column(length = 255)
    private String profile;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "salon_id")
    private HairSalon hairSalon;


    @Builder
    public AdminStylist(Integer stylistId, String name, String callNumber,
                        LocalTime startTime, LocalTime endTime, short holidayMask,
                        String introduction, String profile, HairSalon hairSalon) {
        this.stylistId = stylistId;
        this.name = name;
        this.callNumber = callNumber;
        this.startTime = startTime;
        this.endTime = endTime;
        this.holidayMask = holidayMask;
        this.introduction = introduction;
        this.profile = profile;
        this.hairSalon = hairSalon;
    }

}
