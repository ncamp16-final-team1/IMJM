package com.IMJM.common.test.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.sql.Date;

@Data
@Entity
@Table(name = "\"user\"")
public class UserEntity {

    @Id
    private String id;

    @Enumerated(EnumType.STRING)
    @Column(name="user_type")
    private UserType userType;

    @Column(name = "first_name")
    private String firstName;

    @Column(name = "last_name")
    private String lastName;

    @Enumerated(EnumType.STRING)
    private Language language;

    private String email;

    @Enumerated(EnumType.STRING)
    private Gender gender;

    private String nickname;

    private String profile;

    private Date birthday;

    private String region;

    private Integer point;

    @Column(name = "is_notification")
    private Boolean isNotification;

    // Enum 정의
    public enum UserType {
        member, stylist
    }

    public enum Language {
        ko, en
    }

    public enum Gender {
        male, female
    }
}
