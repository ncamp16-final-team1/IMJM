package com.IMJM.user.dto;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.core.user.OAuth2User;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Map;

public class CustomOAuth2UserDto implements OAuth2User {

    private final UserResisterDto userResisterDto;

    public CustomOAuth2UserDto(UserResisterDto userResisterDto) {
        this.userResisterDto = userResisterDto;
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
                return userResisterDto.getUserType();
            }
        });

        return collection;
    }

    @Override
    public String getName() {
        return "";
    }

    public String getId(){
        return userResisterDto.getId();
    }

    public String getEmail(){
        return userResisterDto.getEmail();
    }

    public String getLastName(){
        return userResisterDto.getLastName();
    }

    public String getFirstName(){
        return userResisterDto.getFirstName();
    }
}
