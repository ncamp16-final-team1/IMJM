import React, { useState } from 'react';
import axios from 'axios';
import { useLocation, useNavigate  } from 'react-router-dom';
import { 
  Container, TextField, Button, Typography, Paper, RadioGroup, FormControlLabel, Radio, Checkbox, FormGroup 
} from '@mui/material';

const UserDetailRegister: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { userType } = location.state || {};

  const [form, setForm] = useState({
    language: '',
    gender: '',
    nickname: '',
    profile: '', // 파일 업로드 처리 필요
    birthday: '',
    region: '',
    is_notification: true,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async () => {
    const fullData = { userType, ...form };
  
    try {
      const response = await axios.post('http://localhost:8080/user/register', fullData, {
        withCredentials: true, // 쿠키 전송 필요 시 사용
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      if (response.status === 200) {
        alert('회원가입이 완료되었습니다!');
        navigate('/');
      }
    } catch (error) {
      console.error('회원가입 중 오류 발생:', error);
      alert('회원가입 실패');
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 5 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h6" gutterBottom>
          회원 정보 입력
        </Typography>
        <RadioGroup row name="language" value={form.language} onChange={handleChange}>
          <FormControlLabel value="KOREAN" control={<Radio />} label="한국어" />
          <FormControlLabel value="ENGLISH" control={<Radio />} label="영어" />
        </RadioGroup>
        <RadioGroup row name="gender" value={form.gender} onChange={handleChange}>
          <FormControlLabel value="MALE" control={<Radio />} label="남자" />
          <FormControlLabel value="FEMALE" control={<Radio />} label="여자" />
        </RadioGroup>
        <TextField label="닉네임" fullWidth sx={{ my: 1 }} name="nickname" value={form.nickname} onChange={handleChange} />
        <input type="file" name="profile" onChange={(e) => console.log('업로드 처리 필요')} />
        <TextField type="date" name="birthday" fullWidth sx={{ my: 1 }} value={form.birthday} onChange={handleChange} />
        <RadioGroup row name="region" value={form.region} onChange={handleChange}>
          <FormControlLabel value="ASIA" control={<Radio />} label="아시아" />
          <FormControlLabel value="EUROPE" control={<Radio />} label="유럽" />
          <FormControlLabel value="AFRICA" control={<Radio />} label="아프리카" />
          <FormControlLabel value="OCEANIA" control={<Radio />} label="오세아니아" />
          <FormControlLabel value="AMERICAS" control={<Radio />} label="아메리카" />
          <FormControlLabel value="ANTARCTICA" control={<Radio />} label="남극" />
        </RadioGroup>
        <FormGroup>
          <FormControlLabel
            control={<Checkbox checked={form.is_notification} onChange={handleChange} name="is_notification" />}
            label="알림 수신 동의"
          />
        </FormGroup>
        <Button fullWidth variant="contained" sx={{ mt: 2 }} onClick={handleSubmit}>가입 완료</Button>
      </Paper>
    </Container>
  );
};

export default UserDetailRegister;