import React, { useState, useEffect  } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logoImage from "../../assets/images/IMJM-logo-Regi.png";
import {
  Container,
  TextField,
  Button,
  Typography,
  Paper,
  Box,
  FormControlLabel,
  RadioGroup,
  Radio,
  FormLabel
} from '@mui/material';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    id: '',
    password: '',
    confirmPassword: '',
    name: '',
    corpRegNumber: '',
    address: '',
    detailAddress: '',
    callNumber: '',
    introduction: '',
    holidayMask: 0,
    startTime: '',
    endTime: '',
    latitude: '',
    longitude: '',
    timeUnit: '30',
  });
  
  const [isScriptsLoaded, setIsScriptsLoaded] = useState(false);

  useEffect(() => {
    const loadScripts = () => {
      let postcodeLoaded = false;
      let kakaoScriptAppended = false;

      const checkAllReady = () => {
        if (postcodeLoaded && kakaoScriptAppended) {
          if ((window as any).kakao && (window as any).kakao.maps) {
            (window as any).kakao.maps.load(() => {
              setIsScriptsLoaded(true);
            });
          }
        }
      };
  
      const postcodeScript = document.createElement('script');
      postcodeScript.src = 'https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';
      postcodeScript.async = true;
      postcodeScript.onload = () => {
        postcodeLoaded = true;
        checkAllReady();
      };
  
      const kakaoScript = document.createElement('script');
      kakaoScript.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=02f33a38e876dff501b53646bfead0d7&autoload=false&libraries=services`;
      kakaoScript.async = true;
      kakaoScript.onload = () => {
        kakaoScriptAppended = true;
        checkAllReady();
      };
  
      document.body.appendChild(postcodeScript);
      document.body.appendChild(kakaoScript);

      
    };
  
    loadScripts();
    const originalBg = document.body.style.backgroundColor;
    document.body.style.backgroundColor = '#FDF6F3';

    return () => {
      document.body.style.backgroundColor = originalBg;
    };
  }, []);

  const handleAddressSearch = () => {
    const { daum, kakao } = window as any;
  
    if (!isScriptsLoaded || !daum?.Postcode || !kakao?.maps?.services) {
      console.log({
        isScriptsLoaded,
        daumLoaded: !!daum?.Postcode,
        kakaoLoaded: !!kakao?.maps?.services,
      });
      return;
    }
  
    new daum.Postcode({
      oncomplete: function (data: any) {
        let fullAddress = data.address;
        let extraAddress = '';
  
        if (data.addressType === 'R') {
          if (data.bname) extraAddress += data.bname;
          if (data.buildingName) {
            extraAddress += (extraAddress ? ', ' : '') + data.buildingName;
          }
          if (extraAddress) {
            fullAddress += ` (${extraAddress})`;
          }
        }
  
        const geocoder = new kakao.maps.services.Geocoder();
  
        geocoder.addressSearch(fullAddress, function (result: any, status: any) {
          if (status === kakao.maps.services.Status.OK) {
            const latitude = result[0].y;
            const longitude = result[0].x;
  
            setForm(prev => ({
              ...prev,
              address: fullAddress,
              latitude,
              longitude,
            }));
          } else {
            setForm(prev => ({
              ...prev,
              address: fullAddress,
              latitude: '',
              longitude: '',
            }));
          }
        });
      },
    }).open();
  };

  const [holidays, setHolidays] = useState<{ [key: string]: boolean }>({
    월: false, 화: false, 수: false, 목: false, 금: false, 토: false, 일: false,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleHolidayChange = (day: string) => {
    setHolidays(prev => {
      const updated = { ...prev, [day]: !prev[day] };
      let bitmask = 0;
      Object.entries(updated).forEach(([key, value], index) => {
        if (value) bitmask |= 1 << index;
      });
      setForm(prev => ({ ...prev, holidayMask: bitmask }));
      return updated;
    });
  };

  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setImages(filesArray);
  
      const previewUrls = filesArray.map(file => URL.createObjectURL(file));
      setPreviews(previewUrls);
    }
  };

  const handleSubmit = async () => {
    if (form.password !== form.confirmPassword) {
      alert('비밀번호가 일치하지 않습니다.');
      return;
    }

    const formData = new FormData();
    
    formData.append('joinDTO', new Blob([JSON.stringify(form)], { type: 'application/json' }));

    images.forEach(image => {
      formData.append('photos', image);
    });

    try {
      const response = await fetch('/api/admin/join', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        alert('회원가입이 완료되었습니다!');
        navigate('/login');
      } else {
        alert('회원가입에 실패했습니다.');
      }
    } catch (error) {
      console.error('에러 발생:', error);
      alert('서버 오류가 발생했습니다.');
    }
  };

  return (
    <Container fixed sx={{ width: 1280, mt: 0, bgcolor: '#FDF6F3', height: 803, py: 4 }} maxWidth="lg">
      <Paper elevation={0} sx={{ p: 0, display: 'flex', gap: 6, bgcolor: '#FDF6F3' }}>
        <Box>
          <img
            src={logoImage}
            alt="IMJM Logo"
            width="110"
            height="40"
          />
        </Box>
        {/* 왼쪽 영역 */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Typography fontWeight="bold">아이디</Typography>
          <TextField label="아이디" name="id" value={form.id} onChange={handleInputChange} />
          <Typography fontWeight="bold">비밀번호</Typography>
          <TextField label="비밀번호" name="password" type="password" value={form.password} onChange={handleInputChange} />
          <TextField label="비밀번호 확인" name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleInputChange} />
          <Typography fontWeight="bold">사업자 번호</Typography>
          <TextField label="사업자 번호" name="corpRegNumber" value={form.corpRegNumber} onChange={handleInputChange} />
          <Typography fontWeight="bold">매장 이름</Typography>
          <TextField label="매장 이름" name="name" value={form.name} onChange={handleInputChange} />
          <Typography fontWeight="bold">주소</Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField label="주소" name="address" value={form.address} onChange={handleInputChange}
                InputProps={{readOnly: true}} />
            <Button onClick={handleAddressSearch}>주소 찾기</Button>
          </Box>
          <TextField label="상세 주소" name="detailAddress" value={form.detailAddress} onChange={handleInputChange} />
        </Box>

        {/* 오른쪽 영역 */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Typography fontWeight="bold">연락처</Typography>
          <TextField name="callNumber" value={form.callNumber} onChange={handleInputChange} />
          <Box>
            <Typography fontWeight="bold" gutterBottom>매장 사진</Typography>
            <input
              accept="image/*"
              id="upload-photos"
              type="file"
              multiple
              style={{ display: 'none' }}
              onChange={handleImageChange}
            />
            <label htmlFor="upload-photos" style={{ cursor: 'pointer', display: 'inline-block' }}>
              <Box
                sx={{
                  width: 95,
                  height: 70,
                  bgcolor: '#ddd',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderRadius: 1,
                  '&:hover': {
                    bgcolor: '#ccc',
                  },
                }}
              >
                <Typography fontSize="2rem">＋</Typography>
              </Box>
            </label>
            <Box mt={1} sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {previews.map((src, index) => (
                <img
                  key={index}
                  src={src}
                  alt={`preview-${index}`}
                  style={{ width: 95, height: 70, objectFit: 'cover', borderRadius: 4 }}
                />
              ))}
            </Box>
          </Box>

          <Typography fontWeight="bold">매장 소개</Typography>
          <TextField name="introduction" multiline rows={2} value={form.introduction} onChange={handleInputChange} />

          <Typography fontWeight="bold">휴일</Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {['월', '화', '수', '목', '금', '토', '일'].map((day, idx) => (
              <Button
                key={day}
                variant={holidays[day] ? 'contained' : 'outlined'}
                onClick={() => handleHolidayChange(day)}
              >
                {day}
              </Button>
            ))}
          </Box>

          <Typography fontWeight="bold">영업 시간</Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField type="time" name="startTime" value={form.startTime} onChange={handleInputChange} />
            <Typography sx={{ lineHeight: '56px' }}>~</Typography>
            <TextField type="time" name="endTime" value={form.endTime} onChange={handleInputChange} />
          </Box>
          <FormLabel sx={{ fontWeight: 'bold', mb: 1 }}>예약 시간 단위</FormLabel>
          <RadioGroup
            row
            value={form.timeUnit}
            onChange={(e) => setForm({ ...form, timeUnit: e.target.value })}
          >
            <FormControlLabel value="30" control={<Radio />} label="30분" />
            <FormControlLabel value="60" control={<Radio />} label="1시간" />
          </RadioGroup>
        </Box>

        <Box sx={{ alignSelf: 'flex-end', mt: 'auto', pl: 2, pb: 2 }}>
          <Button onClick={handleSubmit}>Next →</Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default Register;