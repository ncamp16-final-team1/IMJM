package com.IMJM.user.dto;

import java.util.Map;

public class GoogleResponseDto implements OAuth2ResponseDto{

    private final Map<String, Object> attributes;

    public GoogleResponseDto(Map<String, Object> attributes) {
        this.attributes = attributes;
    }

    @Override
    public String getProvider() {
        return "google";
    }

    @Override
    public String getProviderId() {
        return attributes.get("sub").toString();
    }

    @Override
    public String getEmail() {
        return attributes.get("email").toString();
    }

    @Override
    public String getLastName() {
        return attributes.get("given_name").toString();
    }

    @Override
    public String getFirstName() {
        return attributes.get("family_name").toString();
    }
}
