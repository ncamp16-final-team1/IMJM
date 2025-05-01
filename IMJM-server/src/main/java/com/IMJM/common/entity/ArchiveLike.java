package com.IMJM.common.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "archive_like")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@IdClass(ArchiveLikeId.class)  // 복합 키 클래스 지정
public class ArchiveLike {

    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "archive_id")
    private Archive archive;

    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private Users user;

}
