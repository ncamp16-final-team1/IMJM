package com.IMJM.user.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "member")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Member {

    @Id
    @Column(length = 100, nullable = false)
    private String id;

    @OneToOne
    @JoinColumn(name = "id")
    private User user;

    @Column(length = 50)
    private String history;

    @Column(name = "washing_hair", length = 20)
    private String washingHair;
}