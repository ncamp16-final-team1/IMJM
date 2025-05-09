package com.IMJM.common.entity;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
@Table(name = "users", uniqueConstraints = {
        @UniqueConstraint(columnNames = "email"),
        @UniqueConstraint(columnNames = "nickname")
})
@ToString
public class Users {

    @Id
    private String id;

    @Column(name = "user_type", length = 20)
    private String userType;

    @Column(name = "first_name", length = 50)
    private String firstName;

    @Column(name = "last_name", length = 20)
    private String lastName;

    @Column(length = 20)
    private String language;

    @Column(length = 50, nullable = false)
    private String email;

    @Column(length = 20)
    private String gender;

    @Column(length = 50, nullable = false)
    private String nickname;

    @Column(length = 255)
    private String profile;

    private LocalDate birthday;

    @Column(length = 15)
    private String region;

    @Column(nullable = false)
    @Builder.Default
    private int point = 0;

    @Column(name = "is_notification")
    @JsonProperty("isNotification")
    private boolean isNotification;

    @Column(length = 255)
    private String address;

    @Column(precision = 10, scale = 8)
    private BigDecimal latitude;

    @Column(precision = 11, scale = 8)
    private BigDecimal longitude;

    @Column(name = "terms_agreed")
    private boolean termsAgreed;

    public void updateName(String firstName, String lastName) {
        this.firstName = firstName;
        this.lastName = lastName;
    }

    public void updateEmail(String email) {
        this.email = email;
    }

    public void updateUserType(String userType) {
        this.userType = userType;
    }

    public void updateDetailInfo(String language, String gender, String nickname, String profile,
                                 LocalDate birthday, String region, boolean isNotification, boolean termsAgreed) {
        this.language = language;
        this.gender = gender;
        this.nickname = nickname;
        this.profile = profile;
        this.birthday = birthday;
        this.region = region;
        this.isNotification = isNotification;
        this.termsAgreed = termsAgreed;
    }

    public void updateUserProfile(String nickname, String profile) {
        this.nickname = nickname;
        this.profile = profile;
    }

    public void updateLocation(BigDecimal latitude, BigDecimal longitude) {
        this.latitude = latitude;
        this.longitude = longitude;
    }

    public void deleteAccount() {
        this.gender = null;
        this.nickname = null;
        this.profile = null;
        this.birthday = null;
        this.region = null;
        this.isNotification = false;
        this.termsAgreed = false;
        this.point = 0;
    }

    public void usePoint(int point) {
        this.point -= point;
    }

    public void savePoint(int point) {
        this.point += point;
    }

    public void changeNotificationSetting(boolean isNotification) {
        this.isNotification = isNotification;
    }

    public void updateLanguage(String language) {
        this.language = language;
    }
}
