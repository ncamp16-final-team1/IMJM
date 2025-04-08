package com.IMJM.common.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Date;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
@Table(name = "users", uniqueConstraints = {
        @UniqueConstraint(columnNames = "email"),
        @UniqueConstraint(columnNames = "nickname")
})
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

    @Column(name = "is_notification", nullable = false)
    @Builder.Default
    private boolean isNotification = true;

    @Column(length = 255)
    private String address;

    @Column(precision = 10, scale = 8)
    private BigDecimal latitude;

    @Column(precision = 11, scale = 8)
    private BigDecimal longitude;

    public void updateName(String firstName, String lastName) {
        this.firstName = firstName;
        this.lastName = lastName;
    }

    public void updateEmail(String email) {
        this.email = email;
    }
}
