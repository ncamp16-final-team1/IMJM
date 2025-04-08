package com.IMJM.user.service;

import com.IMJM.user.dto.*;
import com.IMJM.common.entity.Users;
import com.IMJM.user.repository.UserRepository;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepository userRepository;

    public CustomOAuth2UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {

        OAuth2User oAuth2User = super.loadUser(userRequest);

        String registrationId = userRequest.getClientRegistration().getRegistrationId();

        OAuth2ResponseDto oAuth2ResponseDto = null;

        if (registrationId.equals("google")) {
            oAuth2ResponseDto = new GoogleResponseDto(oAuth2User.getAttributes());
        }
//        else if (registrationId.equals("apple")) {
//            oAuth2ResponseDto = new GoogleResponseDto(oAuth2User.getAttributes());
//        }
        else {
            return null;
        }

        String id = oAuth2ResponseDto.getProvider() + " " + oAuth2ResponseDto.getProviderId();
        Optional<Users> existData = userRepository.findById(id);

        if (existData.isEmpty()) {
            Users newUsers = Users.builder()
                    .id(id)
                    .firstName(oAuth2ResponseDto.getFirstName())
                    .lastName(oAuth2ResponseDto.getLastName())
                    .email(oAuth2ResponseDto.getEmail())
                    .build();

            userRepository.save(newUsers);

            UserResponseDto userResponseDto = UserResponseDto.builder()
                    .id(id)
                    .firstName(oAuth2ResponseDto.getFirstName())
                    .lastName(oAuth2ResponseDto.getLastName())
                    .email(oAuth2ResponseDto.getEmail())
                    .termsAgreed(false)
                    .build();

            return new CustomOAuth2UserDto(userResponseDto);
        }
        else {
            Users users = existData.get();
            users.updateEmail(users.getEmail());
            users.updateName(users.getFirstName(), users.getLastName());

            UserResponseDto userResponseDto = UserResponseDto.builder()
                    .id(users.getId())
                    .userType(users.getUserType())
                    .firstName(oAuth2ResponseDto.getFirstName())
                    .lastName(oAuth2ResponseDto.getLastName())
                    .termsAgreed(users.isTermsAgreed())
                    .build();

            return new CustomOAuth2UserDto(userResponseDto);
        }
    }
}
