package com.IMJM.admin.dto;


import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
public class DayCountDto {
    private int dayOfWeek;
    private long count;

    public DayCountDto(Number dayOfWeek, Number count) {
        this.dayOfWeek = dayOfWeek.intValue();
        this.count = count.longValue();
    }
}