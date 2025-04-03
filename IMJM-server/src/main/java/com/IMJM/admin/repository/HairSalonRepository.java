package com.IMJM.admin.repository;

import com.IMJM.admin.entity.HairSalon;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface HairSalonRepository extends JpaRepository<HairSalon, String> {

   boolean existsById(String id);

   Optional<HairSalon> findById(String id);
}
