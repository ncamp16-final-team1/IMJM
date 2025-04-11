import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Typography, RadioGroup, FormControlLabel, Radio, Container, Paper } from '@mui/material';

const UserTypeSelect: React.FC = () => {
  const [userType, setUserType] = useState('');
  const navigate = useNavigate();

  const handleNext = () => {
    if (userType) {
      navigate('/user/register/step1', { state: { userType } });
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 10 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom>
          회원 유형 선택
        </Typography>
        <RadioGroup value={userType} onChange={(e) => setUserType(e.target.value)}>
          <FormControlLabel value="MEMBER" control={<Radio />} label="고객" />
          <FormControlLabel value="STYLLIST" control={<Radio />} label="스타일리스트" />
        </RadioGroup>
        <Button fullWidth variant="contained" sx={{ mt: 3 }} onClick={handleNext} disabled={!userType}>
          다음
        </Button>
      </Paper>
    </Container>
  );
};

export default UserTypeSelect;