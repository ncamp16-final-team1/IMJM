package com.IMJM.admin.service;

import com.IMJM.admin.dto.HairSalonDto;
import com.IMJM.admin.entity.HairSalon;
import com.IMJM.admin.repository.HairSalonRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class JoinService {

    private final HairSalonRepository hairSalonRepository;
    private final BCryptPasswordEncoder bCryptPasswordEncoder;

    public JoinService(HairSalonRepository hairSalonRepository, BCryptPasswordEncoder bCryptPasswordEncoder) {

        this.hairSalonRepository = hairSalonRepository;
        this.bCryptPasswordEncoder = bCryptPasswordEncoder;
    }

    public void joinProcess(HairSalonDto joinDTO) {

        String id = joinDTO.getId();
        String password = joinDTO.getPassword();

        boolean isExist = hairSalonRepository.existsById(id);

        if (isExist) {

            return;
        }

        HairSalon data = HairSalon.builder()
                .id(id)
                .password(bCryptPasswordEncoder.encode(password))
                .name(joinDTO.getName())
                .holidayMask(joinDTO.getHolidayMask())
                .build();

        hairSalonRepository.save(data);
    }
}