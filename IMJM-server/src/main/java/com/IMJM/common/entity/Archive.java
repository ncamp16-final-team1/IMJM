package com.IMJM.common.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
@Table(name = "archive")
public class Archive {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private Users user;

    @Column(columnDefinition = "TEXT")
    private String content;

    @Column(length = 50)
    private String service;

    @Column(length = 10)
    private String gender;

    @Column(length = 50)
    private String color;

    @Column(length = 50)
    private String length;

    @Column(name = "reg_date", nullable = false)
    private LocalDateTime regDate;
}