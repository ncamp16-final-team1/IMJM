package com.IMJM.user.dto;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.core.user.OAuth2User;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Map;

public class CustomOAuth2UserDto implements OAuth2User {

    private final UserResponseDto userResponseDto;

    public CustomOAuth2UserDto(UserResponseDto userResponseDto) {
        this.userResponseDto = userResponseDto;
    }

    @Override
    public Map<String, Object> getAttributes() {
        return null;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {

        Collection<GrantedAuthority> collection = new ArrayList<>();

        collection.add(new GrantedAuthority() {
            @Override
            public String getAuthority() {
                return userResponseDto.getUserType();
            }
        });

        return collection;
    }

    @Override
    public String getName() {
        return "";
    }

    public String getId(){
        return userResponseDto.getId();
    }

    public String getEmail(){
        return userResponseDto.getEmail();
    }

    public String getLastName(){
        return userResponseDto.getLastName();
    }

    public String getFirstName(){
        return userResponseDto.getFirstName();
    }
}
