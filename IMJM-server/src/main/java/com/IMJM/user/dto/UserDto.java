package com.IMJM.user.dto;

import lombok.Data;

@Data
public class UserDto {
    private String userType;
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
    private String hairSalon;
    private String license;

    public UserDto() {
        this.userType = getUserType();
        this.firstName = getFirstName();
        this.lastName = getLastName();
        this.language = getLanguage();
        this.email = getEmail();
        this.gender = getGender();
        this.nickname = getNickname();
        this.profile = getProfile();
        this.birthday = getBirthday();
        this.region = getRegion();
        this.point = getPoint();
        this.isNotification = isNotification();
        this.history = getHistory();
        this.washingHair = getWashingHair();
        this.hairSalon = getHairSalon();
        this.license = getLicense();
    }
}