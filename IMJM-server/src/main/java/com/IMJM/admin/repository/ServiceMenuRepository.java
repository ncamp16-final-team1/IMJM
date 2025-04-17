package com.IMJM.admin.repository;

import com.IMJM.common.entity.ServiceMenu;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ServiceMenuRepository extends JpaRepository<ServiceMenu, Long> {

    List<ServiceMenu> findBySalonId(String salonId);

    List<ServiceMenu> findAllBySalonId(String salonId);
}
