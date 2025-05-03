package com.IMJM.salon.repository;

import com.IMJM.common.entity.ServiceMenu;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SalonServiceMenuRepository extends JpaRepository<ServiceMenu, Long> {

    List<ServiceMenu> findBySalonId(String salonId);

    List<ServiceMenu> findBySalonIdAndServiceType(String salonId, String serviceType);
}