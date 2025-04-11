package com.IMJM.admin.service;

import com.IMJM.admin.dto.CustomSalonDetails;
import com.IMJM.common.entity.Salon;
import com.IMJM.admin.repository.SalonRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class CustomSalonDetailsService implements UserDetailsService {

    private final SalonRepository salonRepository;

    public CustomSalonDetailsService(SalonRepository salonRepository) {
        this.salonRepository = salonRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Optional<Salon> salonData = salonRepository.findById(username);

        System.out.println("salonData1: " + salonData);

        // Optional이 비어 있는지 확인
        if (salonData.isPresent()) {
            Salon salon = salonData.get();
            return new CustomSalonDetails(salon);
        }

        return salonData
                .map(CustomSalonDetails::new)
                .orElseThrow(() -> new UsernameNotFoundException("해당 ID의 미용실이 없습니다: " + username));
    }

}
