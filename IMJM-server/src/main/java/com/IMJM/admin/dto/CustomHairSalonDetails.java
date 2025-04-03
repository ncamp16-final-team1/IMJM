package com.IMJM.admin.dto;

import com.IMJM.admin.entity.HairSalon;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.ArrayList;
import java.util.Collection;

public class CustomHairSalonDetails implements UserDetails {

    private final HairSalon hairSalon;

    public CustomHairSalonDetails(HairSalon hairSalon) {
        this.hairSalon = hairSalon;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {

        Collection<GrantedAuthority> collection = new ArrayList<>();

        collection.add(new GrantedAuthority() {
            @Override
            public String getAuthority() {
                return "ROLE_ADMIN";
            }
        });

        return collection;
    }

    @Override
    public String getPassword() {
        return hairSalon.getPassword();
    }

    @Override
    public String getUsername() {
        return hairSalon.getId();
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}
