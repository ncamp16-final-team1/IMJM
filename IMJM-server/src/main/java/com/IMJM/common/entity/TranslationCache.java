package com.IMJM.common.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Getter
@Builder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Table(name = "translation_cache", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"text_hash", "source_language", "target_language"})
})
public class TranslationCache {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "source_text", nullable = false, columnDefinition = "TEXT")
    private String sourceText;

    @Column(name = "source_language", nullable = false, length = 10)
    private String sourceLanguage;

    @Column(name = "target_language", nullable = false, length = 10)
    private String targetLanguage;

    @Column(name = "translated_text", nullable = false, columnDefinition = "TEXT")
    private String translatedText;

    @Column(name = "created_at", columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
    private LocalDateTime createdAt;

    @Column(name = "last_used_at", columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
    private LocalDateTime lastUsedAt;

    @Column(name = "use_count")
    private Integer useCount = 1;

    @Column(name = "text_hash", nullable = false, length = 64)
    private String textHash;
}