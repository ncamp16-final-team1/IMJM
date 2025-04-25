import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  Avatar,
  IconButton,
  Grid,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

const UserDetailRegister: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [nicknameStatus, setNicknameStatus] = useState<'unchecked' | 'checking' | 'available' | 'taken'>('unchecked');
  const { userType, salonName, license } = location.state || {};
  const [hasChecked, setHasChecked] = useState(false);

  const [form, setForm] = useState({
    language: localStorage.getItem('language') || 'KR',
    gender: '',
    nickname: '',
    profile: null,
    profilePreview: null,
    birthday: '',
    region: '',
    is_notification: true,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type, checked } = e.target;
  
    setForm((prev) => {
      const updated = {
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      };
  
      if (name === 'nickname' && value !== prev.nickname) {
        setNicknameStatus('unchecked');
      }
  
      return updated;
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setForm((prev) => ({
        ...prev,
        profile: file,
        profilePreview: previewUrl,
      }));
    }
  };

  const isValidDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return (
      dateStr.match(/^\d{4}-\d{2}-\d{2}$/) &&
      date instanceof Date &&
      !isNaN(date.getTime())
    );
  };

  const getTodayDate = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const isValid =
    form.nickname.trim() &&
    isValidDate(form.birthday) &&
    form.gender &&
    form.region &&
    nicknameStatus === 'available';

  const handleNext = () => {
    if (nicknameStatus !== 'available') {
      alert('닉네임 중복 확인을 먼저 완료해주세요.');
      return;
    }

    navigate("/user/final", {
      state: {
        ...form,
        userType,
        salonName,
        license
      },
    });
  };

  const checkNickname = async () => {
    if (!form.nickname.trim()) return;

    setNicknameStatus('checking');
    setHasChecked(true);

    try {
      const response = await fetch(`/api/user/check-nickname?nickname=${encodeURIComponent(form.nickname)}`);
      const result = await response.json();

      if (result.available) {
        setNicknameStatus('available');
      } else {
        setNicknameStatus('taken');
      }
    } catch (error) {
      console.error('닉네임 확인 중 오류 발생:', error);
      setNicknameStatus('unchecked');
    }
  };

  return (
    <Box
      sx={{
        px: 5,
        py: 2.5,
        margin: '0 auto',
        fontFamily: 'sans-serif',
        color: '#333',
      }}
    >
      <Typography fontWeight="bold" fontSize="20px">
        Nickname <span style={{ color: 'salmon', fontSize: '14px' }}>*Required Item</span>
      </Typography>
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', my: 1 }}>
        <TextField
          name="nickname"
          value={form.nickname}
          onChange={(e) => {
            const newNickname = e.target.value;
            handleChange(e);
            if (newNickname !== form.nickname) {
              setNicknameStatus('unchecked');
            }
          }}
          size="small"
          fullWidth
        />
        <Button
          onClick={checkNickname}
          variant="outlined"
          sx={{ height: '40px', minWidth: '120px', fontWeight: 'bold', color: '#FF9080', borderColor: '#FF9080' }}
        >
          중복 확인
        </Button>
      </Box>

      {nicknameStatus === 'available' && (
        <Typography color="green">사용 가능한 닉네임입니다.</Typography>
      )}
      {nicknameStatus === 'taken' && (
        <Typography color="red">이미 사용 중인 닉네임입니다.</Typography>
      )}
      {nicknameStatus === 'checking' && (
        <Typography color="gray">확인 중...</Typography>
      )}
      {nicknameStatus === 'unchecked' && form.nickname.trim() && !hasChecked && (
        <Typography color="orange">중복 확인을 해주세요.</Typography>
      )}
      {nicknameStatus === 'unchecked' && form.nickname.trim() && hasChecked && (
        <Typography color="orange">중복 확인을 다시 진행해주세요.</Typography>
      )}

      <Typography fontWeight="bold" fontSize="20px" sx={{ mt: 1 }}>
        Profile
      </Typography>
      <Box
        sx={{
          width: '80px',
          height: '80px',
          backgroundColor: '#eee',
          borderRadius: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mt: 1,
        }}
      >
        <input
          accept="image/*"
          type="file"
          id="profile-upload"
          style={{ display: 'none' }}
          onChange={handleImageUpload}
        />
        <label htmlFor="profile-upload">
          <IconButton component="span">
            {form.profilePreview ? (
              <Avatar src={form.profilePreview} sx={{ width: 80, height: 80 }} />
            ) : (
              <AddIcon />
            )}
          </IconButton>
        </label>
      </Box>

      <Typography fontWeight="bold" fontSize="20px" sx={{ mt: 1 }}>
        Birthday <span style={{ color: 'salmon', fontSize: '14px' }}>*Required Item</span>
      </Typography>
      <TextField
        type="date"
        name="birthday"
        value={form.birthday}
        onChange={handleChange}
        fullWidth
        size="small"
        sx={{ my: 1 }}
        InputLabelProps={{ shrink: true }}
        inputProps={{
          max: getTodayDate(), // 오늘 날짜까지만 허용
          min: '1900-01-01',   // 예시로 최소 날짜 설정
        }}
      />

      <Typography fontWeight="bold" fontSize="20px" sx={{ mt: 1 }}>
        Gender
      </Typography>
      <Box sx={{ display: 'flex', gap: 2, my: 1 }}>
        <Button
          variant={form.gender === 'MALE' ? 'contained' : 'outlined'}
          onClick={() => setForm({ ...form, gender: 'MALE' })}
          sx={{
            borderColor: '#FF9080',
            color: form.gender === 'MALE' ? '#fff' : '#FF9080',
            backgroundColor: form.gender === 'MALE' ? '#FF9080' : '#fff',
            fontWeight: 'bold',
          }}
        >
          Male
        </Button>
        <Button
          variant={form.gender === 'FEMALE' ? 'contained' : 'outlined'}
          onClick={() => setForm({ ...form, gender: 'FEMALE' })}
          sx={{
            borderColor: '#FF9080',
            color: form.gender === 'FEMALE' ? '#fff' : '#FF9080',
            backgroundColor: form.gender === 'FEMALE' ? '#FF9080' : '#fff',
            fontWeight: 'bold',
          }}
        >
          Female
        </Button>
      </Box>

      <Typography fontWeight="bold" fontSize="20px" sx={{ mt: 2 }}>
        Region
      </Typography>
      <Grid container spacing={1} sx={{ my: 1 }}>
        {['Asia', 'Africa', 'Europe', 'North America', 'South America', 'Oceania'].map((r) => (
          <Grid item key={r}>
            <Button
              variant={form.region === r.toUpperCase().replace(' ', '_') ? 'contained' : 'outlined'}
              onClick={() => setForm({ ...form, region: r.toUpperCase().replace(' ', '_') })}
              sx={{
                borderColor: '#FF9080',
                color: form.region === r.toUpperCase().replace(' ', '_') ? '#fff' : '#FF9080',
                backgroundColor: form.region === r.toUpperCase().replace(' ', '_') ? '#FF9080' : '#fff',
                fontWeight: 'bold',
              }}
            >
              {r}
            </Button>
          </Grid>
        ))}
      </Grid>

      <Typography fontWeight="bold" fontSize="20px" sx={{ mt: 2 }}>
        Would you like to receive notifications?
      </Typography>
      <FormControlLabel
        control={
          <Checkbox
            checked={form.is_notification}
            onChange={handleChange}
            name="is_notification"
            sx={{ color: '#FF9080' }}
          />
        }
        label="Approval"
      />

      <Box sx={{ mt: 3, textAlign: 'right' }}>
        <Button
          onClick={handleNext}
          disabled={!isValid}
          sx={{
            color: '#FF9080',
            fontWeight: 'bold',
            fontSize: '16px',
            textTransform: 'none',
            borderRadius: 0,
            '&:disabled': { color: '#ccc' },
          }}
        >
          Next →
        </Button>
      </Box>
    </Box>
  );
};

export default UserDetailRegister;