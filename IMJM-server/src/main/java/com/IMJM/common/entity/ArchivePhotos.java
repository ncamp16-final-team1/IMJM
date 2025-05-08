package com.IMJM.common.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
@Table(name = "archive_photos")
public class ArchivePhotos {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long photoId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "archive_id", nullable = false)
    private Archive archive;

    @Column(name = "photo_url", length = 255, nullable = false)
    private String photoUrl;

    @Column(name = "photo_order", nullable = false)
    private int photoOrder;

    @Column(name = "upload_date")
    private OffsetDateTime uploadDate;
}