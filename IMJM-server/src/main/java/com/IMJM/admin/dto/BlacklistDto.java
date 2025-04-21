package com.IMJM.admin.dto;

import com.IMJM.common.entity.Blacklist;
import lombok.*;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class BlacklistDto {
    private String userId;
    private String userName;
    private String reason;
    private String blockedDate;
}
