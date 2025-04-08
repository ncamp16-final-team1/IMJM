package com.IMJM.common.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@AllArgsConstructor
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Builder
@Table(name = "member")
public class Member {

    @Id
    @Column(name = "user_id")
    private String userId;

    @Column(length = 50)
    private String history;

    @Column(name = "washing_hair", length = 20)
    private String washingHair;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", insertable = false, updatable = false)
    private Users user;
}