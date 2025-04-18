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
  const { userType } = location.state || {};

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
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
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

  const isValid =
    form.nickname.trim() &&
    form.birthday &&
    form.gender &&
    form.region;

  const handleNext = () => {
    navigate("/user/final", {
      state: {
        ...form,
        userType
      },
    });
  };

  // const handleNext = async () => {
  //   try {
  //     const formData = new FormData();
      
  //     const dto = {
  //       userType,
  //       language: form.language,
  //       gender: form.gender,
  //       nickname: form.nickname,
  //       birthday: form.birthday,
  //       region: form.region,
  //       is_notification: form.is_notification,
  //     };
  
  //     formData.append("userDto", new Blob([JSON.stringify(dto)], { type: "application/json" }));
  //     if (form.profile !== null) {
  //       formData.append("profile", form.profile);
  //     }
  
  //     const response = await axios.post("/api/user/register", formData, {
  //       headers: {
  //         "Content-Type": "multipart/form-data",
  //       },
  //       withCredentials: true,
  //     });
  
  //     if (response.status === 200) {
  //       navigate("/user/final");
  //     }
  //   } catch (err) {
  //     console.error(err);
  //     alert("회원가입 실패");
  //   }
  // };

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
      <TextField
        name="nickname"
        value={form.nickname}
        onChange={handleChange}
        fullWidth
        sx={{ my: 1 }}
        size="small"
      />

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