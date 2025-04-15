import React, { useEffect, useState } from "react";
import axios from "axios";
import StylistModal from "./StylistModal";
import DesignModal from "./DesignModal";

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
  latitude?: string;
  longitude?: string;
}

interface Stylist {
  name: string;
  phoneNumber: string;
}

interface Design {
  type: string;
  design: string;
  price: string;
}

const defaultDays = ['월', '화', '수', '목', '금', '토', '일'];

function Salon() {
  const [open, setOpen] = useState(false);
  const [selectedStylist, setSelectedStylist] = useState(null);

  const [designModalOpen, setDesignModalOpen] = useState(false);
  const [menus, setMenus] = useState([]);

  const [isScriptsLoaded, setIsScriptsLoaded] = useState(false);
  const [form, setForm] = useState<SalonForm>({
    introduction: "",
    startTime: "",
    endTime: "",
    timeUnit: "30",
    address: "",
    detailAddress: "",
    latitude: "",
    longitude: "",
  });

  const [previews, setPreviews] = useState<string[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);
  const [holidays, setHolidays] = useState<{ [key: string]: boolean }>({});
  const [stylists, setStylists] = useState<Stylist[]>([]);
  const [designs, setDesigns] = useState<Design[]>([]);

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

        axios.get(`/api/admin-stylist/stylists`).then((res) => {
          setStylists(res.data);
        });

        axios.get(`/api/salon-designs/designs`).then((res) => {
          setDesigns(res.data);
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
  
    const fileArray = Array.from(files);
    const previewArray = fileArray.map((file) => URL.createObjectURL(file));
  
    setNewImages((prev) => [...prev, ...fileArray]);
    setNewImagePreviews((prev) => [...prev, ...previewArray]);
  };

  const handleAddressSearch = () => {
    const { daum, kakao } = window as any;
  
    if (!isScriptsLoaded || !daum?.Postcode || !kakao?.maps?.services) {
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

  const handleSave = async () => {
    try {
      let holidayMask = 0;
      defaultDays.forEach((day, i) => {
        if (holidays[day]) holidayMask |= (1 << i);
      });
  
      const updatedForm = { ...form, holidayMask };
      console.log(updatedForm);

      const formData = new FormData();
  
      formData.append(
        'salonUpdateDto',
        new Blob([JSON.stringify(updatedForm)], { type: 'application/json' })
      );
  
      newImages.forEach((file) => {
        formData.append('newPhotos', file);
      });

      for (const pair of formData.entries()) {
        console.log(`${pair[0]}:`, pair[1]);
      }
  
      await axios.post('/api/salons/update', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
  
      alert('미용실 정보가 저장되었습니다.');
    } catch (error) {
      console.error('미용실 정보 저장 실패:', error);
    }
  };

  const handleDesignOpen = async () => {
    const response = await fetch(`/api/salon-designs/designs`);
    const data = await response.json();
    setMenus(data);
    setDesignModalOpen(true);
  };

  const handleDesignSave = async (rows) => {
    await fetch(`/api/salon-designs/menus`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(rows),
    });
  };

  const handleStylistAddOpen = () => {
    setSelectedStylist(null);
    setOpen(true);
  };

  const handleStylistEditOpen = (stylist) => {
      setSelectedStylist(stylist);
      setOpen(true);
  };

  const handleStylistDelete = async (stylistId) => {
    const confirm = window.confirm("정말로 이 스타일리스트를 삭제하시겠습니까?");
    if (!confirm) return;
  
    try {
      await axios.delete(`/api/admin-stylist/${stylistId}`);
      setStylists((prev) => prev.filter((stylist) => stylist.stylistId !== stylistId));
    } catch (err) {
      console.error(err);
      alert("삭제에 실패했습니다.");
    }
  };

  return (
    <Box p={4}>
      <Grid container spacing={4}>
        <Grid item xs={12} md={6} sx={{width: 450}}>
          <Box display="flex" flexDirection="column" alignItems="flex-start">
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
              <label htmlFor="upload-photos" style={{ display: "inline-block", cursor: "pointer" }}>
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

              <Typography mt={1} fontSize="0.9rem" color="text.secondary">
                기존 사진
              </Typography>
              <Box mt={0.5} sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
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

              {newImagePreviews.length > 0 && (
                <>
                  <Typography mt={2} fontSize="0.9rem" color="text.secondary">
                    새로 추가된 사진
                  </Typography>
                  <Box mt={0.5} sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                    {newImagePreviews.map((src, index) => (
                      <img
                        key={index}
                        src={src}
                        alt={`new-preview-${index}`}
                        style={{
                          width: 95,
                          height: 70,
                          objectFit: "cover",
                          borderRadius: 4,
                        }}
                      />
                    ))}
                  </Box>
                </>
              )}
            </Box>

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

            <Typography fontWeight="bold" mt={3} gutterBottom>
              휴일
            </Typography>
            <Box display="flex" gap={1} mt={1} flexWrap="wrap">
              {defaultDays.map((day, idx) => (
                <Button
                  key={idx}
                  variant="contained"
                  onClick={() => handleHolidayChange(day)}
                  sx={{
                    borderRadius: "20px",
                    minWidth: "36px",
                    px: 2,
                    boxShadow: "none",
                    color: holidays[day] ? "#fff" : "#f77c6b",
                    borderColor: "#f77c6b",
                    bgcolor: holidays[day] ? "#f77c6b" : "transparent",
                    "&:hover": {
                      bgcolor: "#f77c6b",
                      color: "#fff",
                      borderColor: "#f77c6b"
                    }
                  }}
                >
                  {day}
                </Button>
              ))}
            </Box>

            <Typography fontWeight="bold" mt={4}>영업 시간</Typography>
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

            <Typography fontWeight="bold" mt={4}>예약 시간 단위</Typography>
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
            
            <Typography fontWeight="bold">주소</Typography>
            <Box sx={{ display: "flex", gap: 1 }}>
              <TextField
                fullWidth
                label="주소"
                name="address"
                value={form.address}
                onChange={handleInputChange}
                sx={{width: 330}}
                InputProps={{readOnly: true}}
              />
              <Button onClick={handleAddressSearch} sx={{width: 120}}>주소 찾기</Button>
            </Box>
            <TextField
              fullWidth
              label="상세 주소"
              name="detailAddress"
              value={form.detailAddress}
              onChange={handleInputChange}
              sx={{ mt: 1 }}
            />
            <Box sx={{ mt: 4, display: "flex", justifyContent: "flex-end" }}>
              <Button
                  variant="contained"
                  onClick={handleSave}
                  sx={{
                    bgcolor: "#FF9080",
                    color: "#fff",
                    boxShadow: "none",
                    "&:hover": {
                      bgcolor: "#FF7563",
                      boxShadow: "none",
                    },
                    height: 33,
                  }}
                >
                저장
              </Button>
            </Box>
          </Box>
        </Grid>

        {/* 오른쪽 섹션 */}
        <Grid item xs={12} md={6} sx={{width: 450}}>
          <Box display="flex" flexDirection="column" alignItems="flex-start">
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: 420 }}>
              <Typography fontWeight="bold" gutterBottom>
                스타일리스트 관리
              </Typography>
              <Button
                variant="contained"
                onClick={handleStylistAddOpen}
                sx={{
                  bgcolor: "#FF9080",
                  color: "#fff",
                  boxShadow: "none",
                  "&:hover": {
                    bgcolor: "#FF7563",
                    boxShadow: "none",
                  },
                  height: 33,
                }}
              >
                스타일리스트 추가
              </Button>
            </Box>
            <TableContainer
              component={Paper}
              sx={{
                width: 420,
                boxShadow: "none",
                border: "1px solid #ccc",
                borderRadius: 2,
                marginTop: 2,
              }}
            >
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ width: 100 }}>이름</TableCell>
                    <TableCell sx={{ width: 140 }}>전화번호</TableCell>
                    <TableCell sx={{ width: 220 }} align="center">수정</TableCell>
                  </TableRow>
                </TableHead>
                
              </Table>
              <Box sx={{ height: 260, overflow: "auto", maxHeight: 260 }}>
                <Table size="small">
                  <TableBody>
                    {stylists.map((stylist, index) => (
                      <TableRow key={index}>
                        <TableCell sx={{ width: 100 }}>{stylist.name}</TableCell>
                        <TableCell sx={{ width: 140 }}>{stylist.callNumber}</TableCell>
                        <TableCell sx={{ width: 190 }} align="center">
                          <Button size="small" onClick={() => handleStylistEditOpen(stylist)}>수정</Button>
                          <Button size="small" color="error" onClick={() => handleStylistDelete(stylist.stylistId)}>삭제</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
            </TableContainer>
            <StylistModal
                open={open}
                handleClose={() => setOpen(false)}
                stylist={selectedStylist}
            />
            
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: 420, mt: 4 }}>
              <Typography fontWeight="bold" gutterBottom>
                디자인 관리
              </Typography>
              <Button
                variant="contained"
                onClick={handleDesignOpen}
                sx={{
                  bgcolor: "#FF9080",
                  color: "#fff",
                  boxShadow: "none",
                  "&:hover": {
                    bgcolor: "#FF7563",
                    boxShadow: "none",
                  },
                  height: 33,
                }}
              >
                디자인 상세보기
              </Button>
            </Box>
            <TableContainer
              component={Paper}
              sx={{
                width: 420,
                boxShadow: "none",
                border: "1px solid #ccc",
                borderRadius: 2,
                marginTop: 2,
              }}
            >
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>타입</TableCell>
                    <TableCell>디자인</TableCell>
                    <TableCell>가격</TableCell>
                  </TableRow>
                </TableHead>
              </Table>
              <Box sx={{ height: 260, overflow: "auto", maxHeight: 260 }}>
                <Table size="small">
                  <TableBody>
                  {designs.map((design, index) => (
                      <TableRow key={index}>
                        <TableCell>{design.serviceType}</TableCell>
                        <TableCell>{design.serviceName}</TableCell>
                        <TableCell>{design.price}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
            </TableContainer>
            <DesignModal
              open={designModalOpen}
              onClose={() => setDesignModalOpen(false)}
              data={menus}
              onSave={handleDesignSave}
            />
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Salon;