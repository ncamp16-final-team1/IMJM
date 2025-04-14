package com.IMJM.reservation.repository;


import com.IMJM.common.entity.AdminStylist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AdminStylistRepository extends JpaRepository<AdminStylist, Long> {

    List<AdminStylist> findBySalonId(String salonId);

    Optional<AdminStylist> findByStylistId(Long stylistId);

}
