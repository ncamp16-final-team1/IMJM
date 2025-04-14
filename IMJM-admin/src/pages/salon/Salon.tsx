import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Button,
  Grid,
  TextField,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  RadioGroup,
  FormControlLabel,
  Radio,
} from "@mui/material";

interface SalonForm {
  introduction: string;
  startTime: string;
  endTime: string;
  timeUnit: string;
  address: string;
  detailAddress: string;
}

const defaultDays = ['월', '화', '수', '목', '금', '토', '일'];

function Salon() {
  const [isScriptsLoaded, setIsScriptsLoaded] = useState(false);
  const [form, setForm] = useState<SalonForm>({
    introduction: "",
    startTime: "",
    endTime: "",
    timeUnit: "30",
    address: "",
    detailAddress: "",
  });

  const [previews, setPreviews] = useState<string[]>([]);
  const [holidays, setHolidays] = useState<{ [key: string]: boolean }>({});

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
  
    axios
      .get("/api/salons/my", { withCredentials: true })
      .then((res) => {
        const data = res.data;
        console.log("미용실 정보:", data);
        
        setForm({
          introduction: data.introduction || "",
          startTime: data.startTime || "",
          endTime: data.endTime || "",
          timeUnit: data.timeUnit?.toString() || "30",
          address: data.address || "",
          detailAddress: data.detailAddress || "",
        });

        const holidayMask = data.holidayMask ?? 0;
        const holidayObj: { [key: string]: boolean } = {};
        defaultDays.forEach((day, i) => {
          holidayObj[day] = (holidayMask & (1 << i)) > 0;
        });
        setHolidays(holidayObj);

        axios.get(`/api/salon-photos`).then((res) => {
          setPreviews(res.data);
        });
      })
      
      .catch((err) => {
        console.error("미용실 정보를 불러오는 데 실패했습니다:", err);
      });
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleHolidayChange = (day: string) => {
    setHolidays((prev) => ({
      ...prev,
      [day]: !prev[day],
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const previewsArray = Array.from(files).map((file) =>
      URL.createObjectURL(file)
    );
    setPreviews(previewsArray);
  };

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

  return (
    <Box p={4}>
      <Typography variant="h5" gutterBottom>
        미용실 정보 관리
      </Typography>

      <Grid container spacing={4}>
        {/* 왼쪽 섹션 */}
        <Grid item xs={12} md={6}>
          <Box display="flex" flexDirection="column" alignItems="center">
            {/* 매장 사진 */}
            <Box>
              <Typography fontWeight="bold" gutterBottom>
                매장 사진
              </Typography>
              <input
                accept="image/*"
                id="upload-photos"
                type="file"
                multiple
                style={{ display: "none" }}
                onChange={handleImageChange}
              />
              <label htmlFor="upload-photos" style={{ cursor: "pointer" }}>
                <Box
                  sx={{
                    width: 95,
                    height: 70,
                    bgcolor: "#ddd",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    borderRadius: 1,
                    "&:hover": {
                      bgcolor: "#ccc",
                    },
                  }}
                >
                  <Typography fontSize="2rem">＋</Typography>
                </Box>
              </label>
              <Box mt={1} sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                {previews.map((src, index) => (
                  <img
                    key={index}
                    src={src}
                    alt={`preview-${index}`}
                    style={{
                      width: 95,
                      height: 70,
                      objectFit: "cover",
                      borderRadius: 4,
                    }}
                  />
                ))}
              </Box>
            </Box>

            {/* 매장 소개 */}
            <Typography fontWeight="bold" mt={3}>
              매장 소개
            </Typography>
            <TextField
              fullWidth
              name="introduction"
              multiline
              rows={3}
              value={form.introduction}
              onChange={handleInputChange}
            />

            {/* 휴일 */}
            <Typography mt={3} gutterBottom>
              휴일
            </Typography>
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
              {defaultDays.map((day) => (
                <Button
                  key={day}
                  variant={holidays[day] ? "contained" : "outlined"}
                  onClick={() => handleHolidayChange(day)}
                >
                  {day}
                </Button>
              ))}
            </Box>

            {/* 영업시간 */}
            <Typography mt={4}>영업 시간</Typography>
            <Box sx={{ display: "flex", gap: 1 }}>
              <TextField
                type="time"
                name="startTime"
                value={form.startTime}
                onChange={handleInputChange}
              />
              <Typography sx={{ lineHeight: "56px" }}>~</Typography>
              <TextField
                type="time"
                name="endTime"
                value={form.endTime}
                onChange={handleInputChange}
              />
            </Box>

            {/* 예약 시간 단위 */}
            <Typography mt={4}>예약 시간 단위</Typography>
            <RadioGroup
              row
              value={form.timeUnit}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, timeUnit: e.target.value }))
              }
            >
              <FormControlLabel value="30" control={<Radio />} label="30분" />
              <FormControlLabel value="60" control={<Radio />} label="1시간" />
            </RadioGroup>
          </Box>
        </Grid>

        {/* 오른쪽 섹션 */}
        <Grid item xs={12} md={6}>
          {/* 주소 입력 */}
          <Typography fontWeight="bold">주소</Typography>
          <Box sx={{ display: "flex", gap: 1 }}>
            <TextField
              fullWidth
              label="주소"
              name="address"
              value={form.address}
              onChange={handleInputChange}
            />
            <Button onClick={handleAddressSearch}>주소 찾기</Button>
          </Box>
          <TextField
            fullWidth
            label="상세 주소"
            name="detailAddress"
            value={form.detailAddress}
            onChange={handleInputChange}
            sx={{ mt: 1 }}
          />

          {/* 스타일리스트 테이블 */}
          <Typography mt={4} variant="h6">
            스타일리스트 관리
          </Typography>
          <Button variant="contained" size="small" sx={{ mb: 1 }}>
            추가
          </Button>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>이름</TableCell>
                  <TableCell>번호</TableCell>
                  <TableCell>수정</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {["홍길동", "가길동", "나길동", "다길동"].map((name, i) => (
                  <TableRow key={i}>
                    <TableCell>{name}</TableCell>
                    <TableCell>010-1111-111{i}</TableCell>
                    <TableCell>
                      <Button size="small" variant="outlined">
                        수정
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* 디자인 테이블 */}
          <Typography mt={4} variant="h6">
            디자인 관리
          </Typography>
          <Button variant="contained" size="small" sx={{ mb: 1 }}>
            수정
          </Button>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>종류</TableCell>
                  <TableCell>디자인</TableCell>
                  <TableCell>가격</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {[{ type: "커트", design: "남성 커트", price: "100,000" }].map((row, i) => (
                  <TableRow key={i}>
                    <TableCell>{row.type}</TableCell>
                    <TableCell>{row.design}</TableCell>
                    <TableCell>{row.price}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Salon;

function getSalonIdFromCookie() {
  throw new Error("Function not implemented.");
}
