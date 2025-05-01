
import { Box, Typography, Avatar } from '@mui/material';
import { LocationOn as LocationIcon } from '@mui/icons-material';
import { Person as PersonIcon } from '@mui/icons-material';
import { ProfileSectionProps } from '../../type/reservation/reservation';
import { useState } from 'react';

const ProfileSection = ({ stylistSchedule }: ProfileSectionProps) => {
  const [imgError, setImgError] = useState(false);

  return (
    <>
      {/* 프로필 이미지 */}
      <Box sx={{ width: '100%', height: 300, overflow: 'hidden' }}>
        <Avatar
          variant="square"
          sx={{
            width: '100%',
            height: '100%',
            fontSize: 16,
            bgcolor: 'grey.300',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
          src={stylistSchedule.profile || ''} 
          alt="stylist profile"
          onError={(e) => {
            e.currentTarget.onerror = null; 
            e.currentTarget.src = ''; 
          }}
        >
          {/* 이미지 없을 경우 "이미지가 없습니다" 텍스트 */}
          {!stylistSchedule.profile && (
            <Typography variant="h5" sx={{ textAlign: 'center', padding: 1, color: 'white' }}>
              이미지가 없습니다.
            </Typography>
          )}
        </Avatar>
      </Box>

      {/* 스타일리스트 정보 */}
      <Box sx={{ mt: 2 }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          {stylistSchedule.name}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <PersonIcon sx={{ fontSize: 18, mr: 0.5, color: 'gray' }} />
          <Typography variant="body2" color="text.secondary">
            {stylistSchedule.introduction || "소개가 없습니다."}
          </Typography>
        </Box>
      </Box>
    </>
  );
};

export default ProfileSection;