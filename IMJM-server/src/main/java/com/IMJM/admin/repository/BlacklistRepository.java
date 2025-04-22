package com.IMJM.admin.repository;

import com.IMJM.common.entity.Blacklist;
import com.IMJM.common.entity.BlacklistId;
import com.IMJM.common.entity.Salon;
import com.IMJM.common.entity.Users;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface BlacklistRepository extends JpaRepository<Blacklist, BlacklistId> {
    List<Blacklist> findBySalonId(String salonId);

    Optional<Blacklist> findByUserAndSalon(Users user, Salon salon);
}
