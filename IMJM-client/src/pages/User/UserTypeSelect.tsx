import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import ContentCutIcon from '@mui/icons-material/ContentCut';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const UserTypeSelect: React.FC = () => {
  const [userType, setUserType] = useState('');
  const navigate = useNavigate();

  const language = localStorage.getItem('language') || 'KR';
  const isKR = language === 'KR';

  const handleSelect = (type: string) => {
    setUserType(type);
  };

  const handleNext = () => {
    if (userType) {
      navigate('/user/register/step1', { state: { userType } });
    }
  };

  const OptionCard = ({
    label,
    icon,
    value,
  }: {
    label: string;
    icon: React.ReactNode;
    value: string;
  }) => (
    <Paper
      onClick={() => handleSelect(value)}
      elevation={0}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        p: 2.5,
        my: 1.5,
        ml: 7,
        mr: 7,
        border: `2px solid ${userType === value ? '#FF9080' : '#E2E2E2'}`,
        borderRadius: 2,
        cursor: 'pointer',
        transition: '0.2s',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box sx={{ color: '#FF9080' }}>{icon}</Box>
        <Typography variant="h6">{label}</Typography>
      </Box>
      {userType === value && (
        <CheckCircleIcon sx={{ color: '#FF9080' }} />
      )}
    </Paper>
  );

 return (
    <Container maxWidth="xs" sx={{ py: 5, mt: 10 }}>
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h5" fontWeight="bold">
          {isKR ? '계정 유형 선택' : 'Account Type'}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {isKR ? '계정 유형을 선택하세요' : 'Choose your account type'}
        </Typography>
      </Box>

      <OptionCard
        label={isKR ? '고객' : 'Customer'}
        icon={<PersonIcon />}
        value="MEMBER"
      />
      <OptionCard
        label={isKR ? '헤어 디자이너' : 'Hair Stylist'}
        icon={<ContentCutIcon />}
        value="STYLIST" // 오타 수정
      />

      <Button
        fullWidth
        variant="text"
        sx={{ mt: 3, color: '#FF9080', fontWeight: 'bold' }}
        onClick={handleNext}
        disabled={!userType}
      >
        {isKR ? '다음 →' : 'Next →'}
      </Button>
    </Container>
  );
};

export default UserTypeSelect;