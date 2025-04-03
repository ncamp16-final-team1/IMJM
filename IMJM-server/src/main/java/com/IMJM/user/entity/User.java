package com.IMJM.user.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.Date;

@Entity
@Table(name = "user")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @Column(length = 100, nullable = false)
    private String id;

    @Enumerated(EnumType.STRING)
    @Column(name = "user_type", nullable = false)
    private UserType userType;

    @Column(name = "first_name", length = 50, nullable = false)
    private String firstName;

    @Column(name = "last_name", length = 20, nullable = false)
    private String lastName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Language language;

    @Column(length = 50, nullable = false, unique = true)
    private String email;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Gender gender;

    @Column(length = 50, nullable = false, unique = true)
    private String nickname;

    @Column(length = 255)
    private String profile;

    @Temporal(TemporalType.DATE)
    @Column(nullable = false)
    private Date birthday;

    @Column(length = 15)
    private String region;

    @Column(nullable = false)
    @Builder.Default
    private int point = 0;

    @Column(name = "is_notification", nullable = false)
    @Builder.Default
    private boolean isNotification = true;

    // Enum 타입 정의
    public enum UserType { MEMBER, STYLIST }
    public enum Language { KO, EN }
    public enum Gender { MALE, FEMALE }
}
