package com.IMJM.notification.repository;

import com.IMJM.common.entity.Alarm;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AlarmRepository extends JpaRepository<Alarm, Long> {
    List<Alarm> findByUserIdOrderByCreatedAtDesc(String userId);

    int countByUserIdAndIsReadFalse(String userId);
}
