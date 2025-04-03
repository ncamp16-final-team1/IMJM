package com.IMJM.user.service;

import com.IMJM.user.dto.CustomOAuth2UserDto;
import com.IMJM.user.dto.GoogleResponseDto;
import com.IMJM.user.dto.OAuth2ResponseDto;
import com.IMJM.user.dto.UserResisterDto;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

@Service
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {

        OAuth2User oAuth2User = super.loadUser(userRequest);

        System.out.println(oAuth2User);

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

        UserResisterDto userResisterDto = new UserResisterDto();
        userResisterDto.setUserType("MEMBER");
        userResisterDto.setId(id);
        userResisterDto.setFirstName(oAuth2ResponseDto.getFirstName());
        userResisterDto.setLastName(oAuth2ResponseDto.getLastName());
        userResisterDto.setEmail(oAuth2ResponseDto.getEmail());

        return new CustomOAuth2UserDto(userResisterDto);
    }
}
