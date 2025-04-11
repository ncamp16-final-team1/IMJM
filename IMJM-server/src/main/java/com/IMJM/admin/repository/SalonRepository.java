package com.IMJM.admin.repository;

import com.IMJM.common.entity.Salon;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SalonRepository extends JpaRepository<Salon, String> {

   boolean existsById(String id);

   Optional<Salon> findById(String id);
}
