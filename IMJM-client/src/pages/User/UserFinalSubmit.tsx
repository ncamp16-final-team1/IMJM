import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Checkbox,
  FormControlLabel,
  Button,
} from '@mui/material';
import axios from 'axios';

const UserFinalSubmit: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    userType,
    language,
    gender,
    nickname,
    profile,
    birthday,
    region,
    is_notification,
    salonName,
    license,
  } = location.state || {};

  const [agreed, setAgreed] = React.useState(false);

  const handleSubmit = async () => {
    try {
      const formData = new FormData();

      const userDto: any = {
        userType,
        language,
        gender,
        nickname,
        birthday,
        region,
        is_notification,
        termsAgreed: agreed,
      };

      if (userType === 'STYLIST') {
        userDto.salonName = salonName;
      }

      formData.append('userDto', new Blob([JSON.stringify(userDto)], { type: 'application/json' }));

      if (profile) {
        formData.append('profile', profile);
      }
      
      if (userType === 'STYLIST' && license) {
        formData.append('license', license);
      }
      
      const response = await axios.post('/api/user/register', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        withCredentials: true,
      });

      if (response.status === 200) {
        window.location.href = '/';
      }
    } catch (err) {
      console.error(err);
      alert('회원가입 실패');
    }
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography fontSize="24px" fontWeight="bold" mb={2}>
        IMJM Terms of Service
      </Typography>

      <Box
        sx={{
          backgroundColor: '#fff8f5',
          borderRadius: 2,
          p: 3,
          mb: 2,
          border: '1px solid #ffcfc5',
        }}
      >
        <Typography fontWeight="bold">Article 1 (Purpose)</Typography>
        <Typography fontSize="14px" mt={1}>
          These Terms of Service ("Terms") define the rights, obligations, and
          responsibilities between IMJM ("Company") and users ("Members")...
        </Typography>

        {/* 나머지 약관 조항 생략 가능 or 스크롤 박스로 만들기 */}
      </Box>

      <FormControlLabel
        control={
          <Checkbox
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            sx={{ color: '#FF9080' }}
          />
        }
        label="Approval"
      />

      <Box sx={{ textAlign: 'right', mt: 3 }}>
        <Button
          onClick={handleSubmit}
          disabled={!agreed}
          sx={{
            color: '#FF9080',
            fontWeight: 'bold',
            fontSize: '16px',
            textTransform: 'none',
            '&:disabled': { color: '#ccc' },
          }}
        >
          Next →
        </Button>
      </Box>
    </Box>
  );
};

export default UserFinalSubmit;