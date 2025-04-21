package com.IMJM.admin.dto;

import lombok.*;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class BlacklistDto {
    private String id;
    private String userId;
    private String userName;
    private String reason;
}
