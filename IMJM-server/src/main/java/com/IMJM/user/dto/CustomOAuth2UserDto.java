package com.IMJM.user.dto;

import com.IMJM.common.entity.Users;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.core.user.OAuth2User;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Map;

public class CustomOAuth2UserDto implements OAuth2User {

    private final Users user;

    public CustomOAuth2UserDto(Users user) {
        this.user = user;
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
                return user.getUserType();
            }
        });

        return collection;
    }

    @Override
    public String getName() {
        return user.getId();
    }

    public String getId(){
        return user.getId();
    }

    public Users getUser(){
        return user;
    }

    public String getEmail(){
        return user.getEmail();
    }

    public String getLastName(){
        return user.getLastName();
    }

    public String getFirstName(){
        return user.getFirstName();
    }

    public Boolean isTermsAgreed(){
        return user.isTermsAgreed();
    }
}
