package com.IMJM.common.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
@Table(name = "community_photos")
public class CommunityPhotos {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "photo_id")
    private Long photoId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "community_id", nullable = false)
    private Community community;

    @Column(name = "photo_url", length = 255, nullable = false)
    private String photoUrl;

    @Column(name = "photo_order", nullable = false)
    private int photoOrder;

    @Column(name = "upload_date")
    private LocalDateTime uploadDate;
}
