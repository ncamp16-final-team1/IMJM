package com.IMJM.archive.repository;

import com.IMJM.common.entity.Archive;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ArchiveRepository extends JpaRepository<Archive, Long> {

    void deleteById(Long id);
}