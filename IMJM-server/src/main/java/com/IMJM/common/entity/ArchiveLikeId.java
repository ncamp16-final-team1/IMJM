package com.IMJM.common.entity;

import java.io.Serializable;
import java.util.Objects;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

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