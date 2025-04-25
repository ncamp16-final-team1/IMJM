package com.IMJM.user.dto;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@Builder
@AllArgsConstructor
public class UserDto {
    private String userType;
    private String id;
    private String firstName;
    private String lastName;
    private String language;
    private String email;
    private String gender;
    private String nickname;
    private String profile;
    private String birthday;
    private String region;
    private int point;
    private boolean isNotification;
    private String history;
    private String washingHair;
    private String salonName;
    private String license;
    private boolean termsAgreed;
    private BigDecimal latitude;
    private BigDecimal longitude;

    public boolean isIs_notification() {
        return isNotification();
    }
}