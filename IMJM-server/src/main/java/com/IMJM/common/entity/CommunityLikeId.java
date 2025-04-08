package com.IMJM.common.entity;

import lombok.*;

import java.io.Serializable;
import java.util.Objects;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CommunityLikeId implements Serializable {

    private Long community;
    private String user;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof CommunityLikeId that)) return false;
        return Objects.equals(community, that.community) && Objects.equals(user, that.user);
    }

    @Override
    public int hashCode() {
        return Objects.hash(community, user);
    }
}