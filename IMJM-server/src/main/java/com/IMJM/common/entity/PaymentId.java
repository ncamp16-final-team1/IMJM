package com.IMJM.common.entity;

import lombok.*;

import java.io.Serializable;
import java.util.Objects;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PaymentId implements Serializable {

    private Long reservation; // Reservation의 PK 타입
    private String user;      // Users의 PK 타입

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof PaymentId that)) return false;
        return Objects.equals(reservation, that.reservation) && Objects.equals(user, that.user);
    }

    @Override
    public int hashCode() {
        return Objects.hash(reservation, user);
    }
}