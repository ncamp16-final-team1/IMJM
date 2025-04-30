import {
  Avatar,
  Box,
  Container,
  IconButton,
  TextField,
  Typography,
  Divider,
  Stack,
  Button
} from '@mui/material';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import { useEffect, useState } from 'react';
import axios from 'axios';
import EditIcon from '@mui/icons-material/Edit';

const UserProfile = () => {
  const [nickname, setNickname] = useState('');
  const [editingNickname, setEditingNickname] = useState(false);
  const [nicknameValid, setNicknameValid] = useState<null | boolean>(null);
  const [gender, setGender] = useState('');
  const [birthday, setBirthday] = useState('');
  const [region, setRegion] = useState('');
  const [profile, setProfile] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isChanged, setIsChanged] = useState(false);

  useEffect(() => {
    axios.get('/api/user/my-profile',
      { withCredentials: true }
    )
      .then(res => {
        const data = res.data;
        setNickname(data.nickname);
        setGender(data.gender);
        setBirthday(data.birthday);
        setRegion(data.region);
        setProfile(data.profile);
      })
      .catch(err => {
        console.log('유저 정보 호출 실패: ', err);

      });
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
      setIsChanged(true);
    }
  };

  const handleSave = () => {
    if (editingNickname && nicknameValid !== true) {
      alert('닉네임 중복 확인이 필요합니다.');
      return;
    }

    const formData = new FormData();
    formData.append('nickname', nickname);

    if (selectedFile) {
      formData.append('profileImage', selectedFile);
    }

    axios.post('/api/user/update-profile', formData, {
      withCredentials: true,
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
      .then(() => {
        alert('프로필이 저장되었습니다.')
        setNicknameValid(null)
        setIsChanged(false);
        setEditingNickname(false);
      })
      .catch(err => {
        console.log('프로필 저장 실패: ', err);
        alert('프로필 저장에 실패했습니다.');
      });
  }

  const checkNickname = () => {
    if (!nickname.trim()) return alert('닉네임을 입력해주세요.');

    axios.get(`/api/user/check-nickname`, {
      params: { nickname },
      withCredentials: true,
    })
      .then(res => {
        if (res.data.available) {
          setNicknameValid(true);
          setIsChanged(true);
        } else {
          setNicknameValid(false);
        }
      })
      .catch(err => {
        console.log('닉네임 중복 확인 실패:', err);
      });
  };

  return (
    <Container maxWidth="sm" sx={{ pt: 4, pb: 6 }}>
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        Profile
      </Typography>

      {/* 프로필 이미지 */}
      <Box display="flex" justifyContent="center" position="relative" mb={3}>
        <Avatar
          sx={{ width: 100, height: 100 }}
          src={preview || profile || undefined}
        />
        <IconButton
          color="primary"
          sx={{
            position: 'absolute',
            bottom: 0,
            right: 'calc(50% - 50px)',
            bgcolor: 'white',
            border: '1px solid #ccc',
            '&:hover': { bgcolor: '#f5f5f5' }
          }}
          component="label"
        >
          <PhotoCameraIcon />
          <input hidden type="file" accept="image/*" onChange={handleFileChange} />
        </IconButton>
      </Box>

      <Box mb={2}>
        <Typography fontWeight="bold" mb={1}>
          Nickname
        </Typography>
        {!editingNickname ? (
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography>{nickname}</Typography>
            <IconButton size="small" onClick={() => setEditingNickname(true)}>
              <EditIcon fontSize="small" />
            </IconButton>
          </Box>
        ) : (
          <Box display="flex" alignItems="center" gap={2}>
            <TextField
              size='small'
              value={nickname}
              onChange={(e) => {
                setNickname(e.target.value);
                setNicknameValid(null);
                setIsChanged(false);
              }}
              sx={{ bgcolor: '#fff', flex: 1 }}
            />
            <Button
              onClick={checkNickname}
              variant="outlined"
              sx={{
                height: '40px',
                minWidth: '120px',
                fontWeight: 'bold',
                color: '#FF9080',
                borderColor: '#FF9080'
              }}
            >
              중복 확인
            </Button>
          </Box>
        )}

        {nicknameValid === true && (
          <Typography color="success.main" fontSize="0.9rem" mt={1}>
            사용 가능한 닉네임입니다.
          </Typography>
        )}
        {nicknameValid === false && (
          <Typography color="error.main" fontSize="0.9rem" mt={1}>
            이미 사용 중인 닉네임입니다.
          </Typography>
        )}
      </Box>
      <Stack spacing={2}>
        <Divider sx={{ mt: 4 }} />
        <Box display="flex" justifyContent="space-between">
          <Typography fontWeight="bold">Gender</Typography>
          <Typography color="text.secondary">{gender}</Typography>
        </Box>
        <Divider sx={{ mt: 4 }} />
        <Box display="flex" justifyContent="space-between">
          <Typography fontWeight="bold">Birthday</Typography>
          <Typography color="text.secondary">{birthday}</Typography>
        </Box>
        <Divider sx={{ mt: 4 }} />
        <Box display="flex" justifyContent="space-between">
          <Typography fontWeight="bold">Area</Typography>
          <Typography color="text.secondary">{region}</Typography>
        </Box>
        <Divider sx={{ mt: 4 }} />
      </Stack>

      <Box display="flex" justifyContent="center" mt={4}>
        <Button
          variant='contained'
          disabled={
            !isChanged ||
            (editingNickname && nicknameValid !== true)
          }
          sx={{
            mt: 2,
            width: '150px',
            bgcolor: '#FF9080',
            color: 'white',
            boxShadow: 'none',
            '&:hover': {
              bgcolor: '#FF7A6B',
              boxShadow: 'none'
            },
            '&.Mui-disabled': {
              bgcolor: '#f5f5f5',
              color: '#ccc'
            }
          }}
          onClick={handleSave}
        >
          Save
        </Button>
      </Box>
    </Container>
  );
};

export default UserProfile;
