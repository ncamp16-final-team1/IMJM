package com.IMJM.common.entity;

import com.IMJM.admin.dto.AdminStylistDto;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalTime;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
@Table(name = "admin_stylist")
public class AdminStylist {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "stylist_id")
    private Long stylistId;

    @Column(length = 10, nullable = false)
    private String name;

    @Column(name = "call_number", length = 20)
    private String callNumber;

    @Column(name = "start_time")
    private LocalTime startTime;

    @Column(name = "end_time")
    private LocalTime endTime;

    @Column(name = "holiday_mask", nullable = false)
    private short holidayMask;

    @Column(length = 255)
    private String profile;

    @Column(columnDefinition = "TEXT")
    private String introduction;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "salon_id", nullable = false)
    private Salon salon;

    public void updateAdminStylist(AdminStylistDto salon) {
        this.name = salon.getName();
        this.callNumber = salon.getCallNumber();
        this.startTime = LocalTime.parse(salon.getStartTime());
        this.endTime = LocalTime.parse(salon.getEndTime());
        this.holidayMask = salon.getHolidayMask();
        this.introduction = salon.getIntroduction();
    }

    public void updateProfile(String profile) {
        this.profile = profile;
    }
}