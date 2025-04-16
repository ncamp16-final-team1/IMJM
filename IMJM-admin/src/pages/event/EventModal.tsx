import React, { useEffect, useState } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, Button, Checkbox, FormControlLabel,
    ToggleButtonGroup, ToggleButton, Box, Typography,
    IconButton
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import CloseIcon from "@mui/icons-material/Close";
import dayjs, { Dayjs } from 'dayjs';
import axios from 'axios';

interface EventModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
    couponToEdit?: CouponDto | null;
}

const EventModal: React.FC<EventModalProps> = ({ open, onClose, onSuccess, couponToEdit }) => {
    const [name, setName] = useState('');
    const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
    const [discountValue, setDiscountValue] = useState('');
    const [minimumPurchase, setMinimumPurchase] = useState('');
    const [startDate, setStartDate] = useState<Dayjs | null>(dayjs());
    const [endDate, setEndDate] = useState<Dayjs | null>(dayjs().add(1, 'month'));
    const [isActive, setIsActive] = useState(true);

    useEffect(() => {
        if (couponToEdit) {
            setName(couponToEdit.name);
            setDiscountType(couponToEdit.discountType as 'percentage' | 'fixed');
            setDiscountValue(String(couponToEdit.discountValue));
            setMinimumPurchase(String(couponToEdit.minimumPurchase));
            setStartDate(dayjs(couponToEdit.startDate));
            setEndDate(dayjs(couponToEdit.expiryDate));
            setIsActive(couponToEdit.isActive);
        } else {
            setName('');
            setDiscountType('percentage');
            setDiscountValue('');
            setMinimumPurchase('');
            setStartDate(dayjs());
            setEndDate(dayjs().add(1, 'month'));
            setIsActive(true);
        }
    }, [couponToEdit, open]);

    const handleSubmit = async () => {
        try {
            const data = {
                name,
                discountType,
                discountValue: parseInt(discountValue),
                minimumPurchase: parseInt(minimumPurchase),
                startDate: startDate?.format('YYYY-MM-DD'),
                expiryDate: endDate?.format('YYYY-MM-DD'),
                isActive
            };
    
            if (couponToEdit) {
                await axios.put(`/api/coupon/${couponToEdit.id}`, data);
            } else {
                await axios.post('/api/coupon/create', data);
            }

            onSuccess();
            onClose();
        } catch (error) {
            console.error('쿠폰 생성 실패:', error);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth sx={{ borderRadius: '20px' }}>
            <DialogTitle display="flex" justifyContent="space-between" sx={{ fontWeight: 'bold', fontSize: '18px' }}>
                이벤트 등록
                <IconButton onClick={onClose}><CloseIcon /></IconButton>
            </DialogTitle>
            <DialogContent dividers sx={{ px: 3, pt: 2 }}>
                <Box display="flex" alignItems="center" gap={1} marginY={1}>
                    <Typography sx={{ width: 90 }}>제목</Typography>
                    <TextField
                        fullWidth
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        size="small"
                        sx={{width: 300}}
                    />
                </Box>

                <Typography sx={{ mt: 1, mb: 1 }}>이벤트 기간</Typography>
                <Box display="flex" alignItems="center" gap={1}>
                    <DatePicker
                        value={startDate}
                        onChange={setStartDate}
                        slotProps={{ textField: { size: 'small', fullWidth: true } }}
                    />
                    <Typography>~</Typography>
                    <DatePicker
                        value={endDate}
                        onChange={setEndDate}
                        slotProps={{ textField: { size: 'small', fullWidth: true } }}
                    />
                </Box>
                <Box display="flex" alignItems="center" gap={1} marginY={1}>
                    <Typography sx={{ width: 90 }}>할인 유형</Typography>
                    <ToggleButtonGroup
                        value={discountType}
                        exclusive
                        onChange={(_, val) => val && setDiscountType(val)}
                        sx={{
                            mt: 1,
                            gap: 2,
                            '& .MuiToggleButton-root': {
                                height: 35,
                                borderRadius: '20px',
                                minWidth: '36px',
                                px: 2,
                                boxShadow: 'none',
                                color: '#f77c6b',
                                borderColor: '#f77c6b',
                                backgroundColor: 'transparent',
                                textTransform: 'none',
                                fontWeight: 'bold',
                                '&:hover': {
                                    bgcolor: '#f77c6b',
                                    color: '#fff',
                                    borderColor: '#f77c6b',
                                }
                            },
                            '& .Mui-selected': {
                                backgroundColor: '#FF9080 !important',
                                color: '#fff !important',
                                '&:hover': {
                                    backgroundColor: '#f77c6b !important',
                                    color: '#fff !important'
                                }
                            }
                        }}
                    >
                        <ToggleButton value="percentage">percentage</ToggleButton>
                        <ToggleButton value="fixed">fixed</ToggleButton>
                    </ToggleButtonGroup>
                </Box>
                <Box display="flex" alignItems="center" gap={1} marginY={1}>
                    <Typography sx={{ width: 90 }}>할인 금액</Typography>
                    <TextField
                        fullWidth
                        label="할인 금액"
                        type="number"
                        value={discountValue}
                        onChange={(e) => setDiscountValue(e.target.value)}
                        margin="dense"
                        size="small"
                        sx={{width: 150}}
                    />
                </Box>
                <Box display="flex" alignItems="center" gap={1} marginY={1}>
                    <Typography sx={{ width: 90 }}>최소 금액</Typography>
                    <TextField
                        fullWidth
                        label="최소 금액"
                        type="number"
                        value={minimumPurchase}
                        onChange={(e) => setMinimumPurchase(e.target.value)}
                        margin="dense"
                        size="small"
                        sx={{width: 150}}
                    />
                </Box>
                <Box display="flex" alignItems="center" gap={1} marginY={1}>
                    <Typography sx={{ width: 100 }}>공개 여부</Typography>
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={isActive}
                                onChange={(e) => setIsActive(e.target.checked)}
                                sx={{ p: 0.5 }}
                            />
                        }
                        label=""
                        sx={{ mt: 1 }}
                    />
                </Box>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button
                    variant="contained"
                    onClick={handleSubmit}
                    sx={{
                        bgcolor: "#FF9080",
                        color: "#fff",
                        borderRadius: '20px',
                        boxShadow: 'none', 
                        "&:hover": {
                            bgcolor: "#FF7563",
                            boxShadow: 'none'
                        }
                    }}
                >
                    등록 하기
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default EventModal;