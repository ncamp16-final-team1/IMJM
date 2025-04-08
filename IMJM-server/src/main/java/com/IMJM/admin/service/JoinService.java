package com.IMJM.admin.service;

import com.IMJM.admin.dto.SalonDto;
import com.IMJM.common.entity.Salon;
import com.IMJM.admin.repository.SalonRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class JoinService {

    private final SalonRepository salonRepository;
    private final BCryptPasswordEncoder bCryptPasswordEncoder;

    public JoinService(SalonRepository salonRepository, BCryptPasswordEncoder bCryptPasswordEncoder) {

        this.salonRepository = salonRepository;
        this.bCryptPasswordEncoder = bCryptPasswordEncoder;
    }

    public void joinProcess(SalonDto joinDTO) {

        String id = joinDTO.getId();
        String password = joinDTO.getPassword();

        boolean isExist = salonRepository.existsById(id);

        if (isExist) {

            return;
        }

        System.out.println(22222);

        Salon data = Salon.builder()
                .id(id)
                .password(bCryptPasswordEncoder.encode(password))
                .name(joinDTO.getName())
                .holidayMask(joinDTO.getHolidayMask())
                .build();

        salonRepository.save(data);
    }
}