package com.IMJM.reservation.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "hair_salon_photos")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class HairSalonPhotos {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "photo_id")
    private Integer photoId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "salon_id")
    private HairSalon hairSalon;

    @Column(name = "photo_url", nullable = false)
    private String photoUrl;

    @Column(name = "photo_order", nullable = false)
    private Integer photoOrder;

    @Column(name = "upload_date")
    private LocalDateTime uploadDate;

    @Builder
    public HairSalonPhotos(HairSalon salon, String photoUrl, Integer photoOrder) {
        this.hairSalon = salon;
        this.photoUrl = photoUrl;
        this.photoOrder = photoOrder;
        this.uploadDate = LocalDateTime.now();
    }

    // 비즈니스 메소드
    public void updateOrder(Integer photoOrder) {
        this.photoOrder = photoOrder;
    }

    public void updatePhotoUrl(String photoUrl) {
        this.photoUrl = photoUrl;
    }
}
