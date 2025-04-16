import React, { useEffect, useState } from "react";
import {
    Modal, Box, TextField, Button, Typography, Grid, IconButton
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import axios from "axios";

const days = ["월", "화", "수", "목", "금", "토", "일"];

const StylistModal = ({ open, handleClose, stylist }) => {
    const isEditMode = Boolean(stylist);
    const [form, setForm] = useState({
        name: "",
        callNumber: "",
        startTime: "",
        endTime: "",
        introduction: "",
        holidays: [],
        profile: null,
        profilePreview: null
    });
    
    useEffect(() => {
        if (stylist) {
            setForm({
                name: stylist.name || "",
                callNumber: stylist.callNumber || "",
                startTime: stylist.startTime || "",
                endTime: stylist.endTime || "",
                introduction: stylist.introduction || "",
                holidays: getHolidayArrayFromMask(stylist.holidayMask || 0),
                profile: null,
                profilePreview: stylist.profile || null, // 기존 이미지 URL
            });
        } else {
            setForm({
                name: "",
                callNumber: "",
                startTime: "",
                endTime: "",
                introduction: "",
                holidays: [],
                profile: null,
                profilePreview: null
            });
        }
    }, [stylist]);

    const getHolidayArrayFromMask = (mask) => {
        return days.map((_, i) => (mask & (1 << i)) ? i : null).filter(v => v !== null);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setForm((prev) => ({
                ...prev,
                profile: file,
                profilePreview: URL.createObjectURL(file),
            }));
        }
    };

    const toggleHoliday = (index) => {
        setForm((prev) => {
            const updated = prev.holidays.includes(index)
                ? prev.holidays.filter((d) => d !== index)
                : [...prev.holidays, index];
            return { ...prev, holidays: updated };
        });
    };

    const getHolidayMask = () =>
        form.holidays.reduce((acc, cur) => acc | (1 << cur), 0);

    const handleSubmit = async () => {
        try {
            const formData = new FormData();
    
            const adminStylistDto = {
                name: form.name,
                callNumber: form.callNumber,
                startTime: form.startTime,
                endTime: form.endTime,
                introduction: form.introduction,
                holidayMask: getHolidayMask(),
            };
    
            formData.append("adminStylistDto", new Blob([JSON.stringify(adminStylistDto)], { type: "application/json" }));
    
            if (form.profile !== null) {
                formData.append("profile", form.profile);
            }
    
            if (isEditMode) {
                await axios.put(`/api/admin-stylist/${stylist.stylistId}`, formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
                alert("스타일리스트 정보가 수정되었습니다!");
            } else {
                await axios.post("/api/admin-stylist/register", formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
                alert("스타일리스트가 성공적으로 추가되었습니다!");
            }
    
            handleClose();
        } catch (err) {
            console.error(err);
            alert("저장 실패");
        }
    };

    return (
        <Modal open={open} onClose={handleClose}>
            <Box sx={{
                position: 'absolute', top: '50%', left: '50%',
                transform: 'translate(-50%, -50%)', width: 700,
                bgcolor: 'white', borderRadius: 2, p: 4,
                boxShadow: 24,
            }}>
                {/* 헤더 */}
                <Box display="flex" justifyContent="space-between" mb={2}>
                    <Typography variant="h6" fontWeight="bold">스타일리스트 관리</Typography>
                    <IconButton onClick={handleClose}><CloseIcon /></IconButton>
                </Box>

                <Grid container spacing={2}>
                    {/* 왼쪽 영역 */}
                    <Grid item xs={12} sm={6}>
                        <Typography>이름</Typography>
                        <TextField
                            label="이름" name="name" fullWidth
                            value={form.name} onChange={handleChange} margin="dense"
                        />
                        <Typography>연락처</Typography>
                        <TextField
                            label="연락처" name="callNumber" fullWidth
                            value={form.callNumber} onChange={handleChange} margin="dense"
                        />
                        <Typography>근무 시간</Typography>
                        <Box display="flex" gap={1} mt={2} alignItems="center">
                            <TextField
                                type="time" name="startTime" value={form.startTime}
                                onChange={handleChange} InputLabelProps={{ shrink: true }}
                            />
                            <Typography>~</Typography>
                            <TextField
                                type="time" name="endTime" value={form.endTime}
                                onChange={handleChange} InputLabelProps={{ shrink: true }}
                            />
                        </Box>
                        <Box mt={3}>
                            <Typography>휴일</Typography>
                            <Box display="flex" gap={1} mt={1} flexWrap="wrap">
                                {days.map((day, idx) => (
                                    <Button
                                        key={idx}
                                        variant="contained"
                                        onClick={() => toggleHoliday(idx)}
                                        sx={{
                                            borderRadius: "20px", minWidth: "36px", px: 2, boxShadow: "none",
                                            color: form.holidays.includes(idx) ? "#fff" : "#f77c6b",
                                            borderColor: "#f77c6b",
                                            bgcolor: form.holidays.includes(idx) ? "#f77c6b" : "transparent",
                                            "&:hover": {
                                                bgcolor: "#f77c6b", color: "#fff", borderColor: "#f77c6b"
                                            }
                                        }}
                                    >
                                        {day}
                                    </Button>
                                ))}
                            </Box>
                        </Box>
                    </Grid>

                    {/* 오른쪽 영역 */}
                    <Grid item xs={12} sm={6}>
                        <Box>
                            <Box display="flex" alignItems="center" gap="55px" mb={1}>
                                <Typography>사진</Typography>
                                <Button component="label"
                                    sx={{
                                        backgroundColor: "#f77c6b", color: "white", fontSize: "0.8rem",
                                        borderRadius: "20px", px: 2, py: 0.5,
                                        "&:hover": { backgroundColor: "#e6685c" }
                                    }}
                                >
                                    수정
                                    <input hidden type="file" accept="image/*" onChange={handleImageChange} />
                                </Button>
                            </Box>
                            <Box sx={{
                                width: 150, height: 120, bgcolor: "#eee", borderRadius: 1,
                                display: "flex", justifyContent: "center", alignItems: "center"
                            }}>
                                {form.profilePreview ? (
                                    <img src={form.profilePreview} alt="preview"
                                        style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                ) : (
                                    <Typography variant="caption" color="textSecondary">사진 없음</Typography>
                                )}
                            </Box>
                        </Box>

                        <Box mt={3}>
                            <Typography>소개</Typography>
                            <TextField
                                name="introduction" multiline rows={4} fullWidth
                                value={form.introduction} onChange={handleChange}
                                sx={{ mt: 1, width: "300px" }}
                            />
                        </Box>
                    </Grid>
                </Grid>

                {/* 하단 버튼 */}
                <Box display="flex" justifyContent="center" mt={4}>
                    <Button
                        variant="contained"
                        onClick={handleSubmit}
                        sx={{
                            backgroundColor: "#f77c6b", borderRadius: "20px", px: 4,
                            "&:hover": { backgroundColor: "#e6685c" }
                        }}
                    >
                        저장
                    </Button>
                </Box>
            </Box>
        </Modal>
    );
};

export default StylistModal;