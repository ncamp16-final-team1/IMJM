package com.IMJM.archive.repository;
import com.IMJM.common.entity.Archive;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;


public interface ArchiveRepository extends JpaRepository<Archive, Long> {
    // 특정 사용자의 아카이브 목록 조회 (최신순)
    List<Archive> findByUserIdOrderByRegDateDesc(String user_id);

    // 서비스별 아카이브 목록 조회
    List<Archive> findByServiceOrderByRegDateDesc(String service);

    // 성별 기준 아카이브 목록 조회
    List<Archive> findByGenderOrderByRegDateDesc(String gender);

    // 서비스와 성별 조합으로 아카이브 목록 조회
    List<Archive> findByServiceAndGenderOrderByRegDateDesc(String service, String gender);

    // 서비스, 성별, 색상 조합으로 아카이브 목록 조회
    List<Archive> findByServiceAndGenderAndColorOrderByRegDateDesc(String service, String gender, String color);

    // 서비스, 성별, 길이 조합으로 아카이브 목록 조회
    List<Archive> findByServiceAndGenderAndLengthOrderByRegDateDesc(String service, String gender, String length);
}