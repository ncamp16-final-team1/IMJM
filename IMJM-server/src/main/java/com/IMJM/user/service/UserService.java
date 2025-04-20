package com.IMJM.user.service;

import com.IMJM.common.entity.Users;
import com.IMJM.user.dto.UserDto;
import com.IMJM.user.repository.UserRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Transactional
    public void completeRegistration(UserDto dto) {
        Users user = userRepository.findById(SecurityContextHolder.getContext().getAuthentication().getName())
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사용자"));

        user.updateUserType(dto.getUserType());
        user.updateDetailInfo(
                dto.getLanguage(), dto.getGender(), dto.getNickname(), dto.getProfile(),
                LocalDate.parse(dto.getBirthday()), dto.getRegion(), dto.isIs_notification()
        );
    }

    public UserDto convertToDto(Users user) {
        UserDto dto = new UserDto();
        dto.setId(user.getId());
        dto.setFirstName(user.getFirstName());
        dto.setLastName(user.getLastName());
        dto.setEmail(user.getEmail());
        dto.setNickname(user.getNickname());
        dto.setProfile(user.getProfile());
        dto.setLanguage(user.getLanguage());
        dto.setGender(user.getGender());
        dto.setBirthday(user.getBirthday().toString());
        dto.setRegion(user.getRegion());
        dto.setPoint(user.getPoint());
        dto.setNotification(user.isNotification());
        return dto;
    }
}
