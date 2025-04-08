package com.IMJM.common.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@AllArgsConstructor
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Builder
@Table(name = "client_stylist")
public class ClientStylist {

    @Id
    @Column(name = "user_id")
    private String userId;

    @Column(name = "salon_name", length = 50)
    private String salonName;

    @Column(length = 255)
    private String license;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", insertable = false, updatable = false)
    private Users user;
}