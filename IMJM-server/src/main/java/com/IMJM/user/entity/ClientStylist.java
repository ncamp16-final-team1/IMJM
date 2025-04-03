package com.IMJM.user.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "client_stylist")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClientStylist {

    @Id
    @Column(length = 100, nullable = false)
    private String id;

    @OneToOne
    @JoinColumn(name = "id")
    private User user;

    @Column(name = "hair_salon", length = 50)
    private String hairSalon;

    @Column(length = 255)
    private String license;
}