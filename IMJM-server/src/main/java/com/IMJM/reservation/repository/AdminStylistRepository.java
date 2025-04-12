package com.IMJM.reservation.repository;


import com.IMJM.common.entity.AdminStylist;
import com.IMJM.common.entity.Reservation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.sql.Time;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface AdminStylistRepository extends JpaRepository<AdminStylist, Long> {

    List<AdminStylist> findBySalonId(String salonId);

    Optional<AdminStylist> findByStylistId(Long stylistId);

}
