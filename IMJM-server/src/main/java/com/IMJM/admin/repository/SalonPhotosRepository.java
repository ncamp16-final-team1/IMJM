package com.IMJM.admin.repository;


import com.IMJM.common.entity.Salon;
import com.IMJM.common.entity.SalonPhotos;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SalonPhotosRepository extends JpaRepository<SalonPhotos, Long> {
    List<SalonPhotos> findBySalon_IdOrderByPhotoOrderAsc(String salonId);

    List<SalonPhotos> findBySalon(Salon salon);
}
