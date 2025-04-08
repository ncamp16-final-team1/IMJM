package com.IMJM.common.entity;

import lombok.*;

import java.io.Serializable;
import java.util.Objects;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ArchiveLikeId implements Serializable {

    private Long archive;
    private String user;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof ArchiveLikeId that)) return false;
        return Objects.equals(archive, that.archive) && Objects.equals(user, that.user);
    }

    @Override
    public int hashCode() {
        return Objects.hash(archive, user);
    }
}