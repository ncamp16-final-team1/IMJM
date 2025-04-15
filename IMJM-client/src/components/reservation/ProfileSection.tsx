// src/components/reservation/ProfileSection.tsx
import { Box, Typography } from '@mui/material';
import { LocationOn as LocationIcon } from '@mui/icons-material';
import { ProfileSectionProps } from '../../type/reservation/reservation';

const ProfileSection = ({ stylistSchedule }: ProfileSectionProps) => {
  return (
    <>
      {/* 프로필 이미지 */}
      <Box sx={{ width: '100%', height: 300, overflow: 'hidden' }}>
        <img
          src={stylistSchedule.profile || ''}
          alt="stylist profile"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center'
          }}
        />
      </Box>

      {/* 스타일리스트 정보 */}
      <Box sx={{ mt: 2 }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          {stylistSchedule.name}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <LocationIcon sx={{ fontSize: 18, mr: 0.5, color: 'gray' }} />
          <Typography variant="body2" color="text.secondary">
            {stylistSchedule.introduction || "소개가 없습니다"}
          </Typography>
        </Box>
      </Box>
    </>
  );
};

export default ProfileSection;