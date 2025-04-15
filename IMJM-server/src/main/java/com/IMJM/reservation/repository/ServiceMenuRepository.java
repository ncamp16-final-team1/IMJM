package com.IMJM.reservation.repository;

import com.IMJM.common.entity.ServiceMenu;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ServiceMenuRepository extends JpaRepository<ServiceMenu, Long> {

    // 서비스_메뉴 테이블에서 살롱id기준으로 조회
    List<ServiceMenu> findBySalonId(String salonId);
}
