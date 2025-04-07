package com.IMJM.user.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
@AllArgsConstructor
public class UserResponseDto {

    private String userType;
    private String id;
    private String email;
    private String firstName;
    private String lastName;

    public UserResponseDto() {
        this.userType = getUserType();
        this.id = getId();
        this.email = getEmail();
        this.firstName = getFirstName();
        this.lastName = getLastName();
    }
}
