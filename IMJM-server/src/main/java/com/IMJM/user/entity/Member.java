package com.IMJM.user.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "member")
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Member {

    @Id
    private String id;  // 기본 키로 사용되는 필드

    @OneToOne
    @MapsId  // User 엔티티의 ID를 사용함
    @JoinColumn(name = "id")  // 외래 키와 기본 키를 같은 값으로 설정
    private User user;

    @Column(length = 50)
    private String history;

    @Column(name = "washing_hair", length = 20)
    private String washingHair;
}