import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  IconButton,
  Avatar,
} from '@mui/material';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';

const RegisterStep1: React.FC = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const userType = state?.userType;

  const [salonName, setSalonName] = useState('');
  const [license, setLicense] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
        const file = e.target.files[0];
        setLicense(file);
        setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleNext = () => {
    const stylistInfo = { userType, salonName, license };
    navigate('/user/register/step2', { state: stylistInfo });
  };

  const isNextDisabled = !salonName || !license;

  return (
    <Container maxWidth="xs" sx={{ py: 5 }}>
      <Typography variant="h6" fontWeight="bold" mt={2}>
        Hair Salon
      </Typography>
      <TextField
        fullWidth
        variant="outlined"
        placeholder="Enter your salon"
        value={salonName}
        onChange={(e) => setSalonName(e.target.value)}
        sx={{ my: 2 }}
      />

      <Typography variant="h6" fontWeight="bold" mt={2}>
        License
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, gap: 2 }}>
        <IconButton component="label">
          <AddPhotoAlternateIcon />
          <input hidden type="file" onChange={handleFileChange} accept="image/*" />
        </IconButton>
        {previewUrl && (
          <Avatar src={previewUrl} alt="License Preview" sx={{ width: 56, height: 56 }} />
        )}
        <Typography>{license ? license.name : 'Upload your license'}</Typography>
      </Box>

      <Button
        fullWidth
        variant="text"
        onClick={handleNext}
        sx={{ mt: 5, color: '#FF9080', fontWeight: 'bold' }}
        disabled={isNextDisabled}
      >
        Next →
      </Button>
    </Container>
  );
};

export default RegisterStep1;
