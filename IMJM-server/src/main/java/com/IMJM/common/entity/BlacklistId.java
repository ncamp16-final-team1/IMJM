package com.IMJM.common.entity;

import lombok.*;

import java.io.Serializable;
import java.util.Objects;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class BlacklistId implements Serializable {

    private String salon;
    private String user;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof BlacklistId that)) return false;
        return Objects.equals(salon, that.salon) && Objects.equals(user, that.user);
    }

    @Override
    public int hashCode() {
        return Objects.hash(salon, user);
    }
}