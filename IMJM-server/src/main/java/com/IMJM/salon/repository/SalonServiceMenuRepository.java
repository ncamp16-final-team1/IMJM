package com.IMJM.salon.repository;

import com.IMJM.common.entity.ServiceMenu;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SalonServiceMenuRepository extends JpaRepository<ServiceMenu, Long> {

    // 살롱 ID로 서비스 메뉴 조회
    List<ServiceMenu> findBySalonId(String salonId);

    // 서비스 타입별 조회
    List<ServiceMenu> findBySalonIdAndServiceType(String salonId, String serviceType);
}