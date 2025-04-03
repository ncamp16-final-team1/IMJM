package com.IMJM.user.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserResisterDto {

    private String userType;
    private String id;
    private String email;
    private String firstName;
    private String lastName;

    public UserResisterDto() {
        this.userType = getUserType();
        this.id = getId();
        this.email = getEmail();
        this.firstName = getFirstName();
        this.lastName = getLastName();
    }
}
