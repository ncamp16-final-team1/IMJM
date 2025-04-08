package com.IMJM.common.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
@Table(name = "service_menu")
public class ServiceMenu {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "service_type", length = 100, nullable = false)
    private String serviceType;

    @Column(name = "service_name", length = 100, nullable = false)
    private String serviceName;

    @Column(name = "service_description", columnDefinition = "TEXT")
    private String serviceDescription;

    @Column(nullable = false)
    private int price;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "salon_id", nullable = false)
    private Salon salon;
}