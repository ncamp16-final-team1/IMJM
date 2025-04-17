import React, { useEffect, useState } from 'react';
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Paper, Checkbox, Button, Typography
} from '@mui/material';
import axios from 'axios';
import EventModal from './EventModal';
import ConfirmDialog from './ConfirmDialog';
import dayjs from 'dayjs';

type CouponDto = {
    id: number;
    name: string;
    discountType: string;
    discountValue: number;
    minimumPurchase: number;
    startDate: string;
    expiryDate: string;
    isActive: boolean;
    createAt: string;
    useCount: number
};

const Event = () => {
    const [openModal, setOpenModal] = useState(false);
    const [coupons, setCoupons] = useState<CouponDto[]>([]);
    const [openConfirm, setOpenConfirm] = useState(false);
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [couponToEdit, setCouponToEdit] = useState<CouponDto | null>(null);

    const fetchCoupons = async () => {
        const res = await axios.get('/api/admin/coupon/list');
        setCoupons(res.data);
    };

    useEffect(() => {
        fetchCoupons();
    }, []);

    const handleDelete = async () => {
        if (selectedId === null) return;
        try {
            await axios.delete(`/api/admin/coupon/${selectedId}`);
            setCoupons(prev => prev.filter(c => c.id !== selectedId));
        } catch (error) {
            console.error('삭제 실패:', error);
        } finally {
            setOpenConfirm(false);
            setSelectedId(null);
        }
    };
    
    const openDeleteModal = (id: number) => {
        setSelectedId(id);
        setOpenConfirm(true);
    };

    const handleRowClick = (coupon: CouponDto) => {
        setCouponToEdit(coupon);
        setOpenModal(true);
    };

    return (
        <div style={{ padding: '30px', width: '950px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                <Typography variant="h4" fontWeight="bold" mb={4}>이벤트 관리</Typography>
                <Button variant="contained" color="warning" sx={{ fontWeight: 'bold' }} onClick={() => setOpenModal(true)}>
                    이벤트 등록
                </Button>
            </div>
            <TableContainer component={Paper} sx={{ borderRadius: '12px', border: '2px solid #FF9080', height: '670px' }}>
                <Table>
                    <TableHead>
                        <TableRow sx={{ backgroundColor: '#FF9080' }}>
                            <TableCell align="center">번호</TableCell>
                            <TableCell align="center">제목</TableCell>
                            <TableCell align="center">등록일</TableCell>
                            <TableCell align="center">기간</TableCell>
                            <TableCell align="center">사용 수</TableCell>
                            <TableCell align="center">공개 여부</TableCell>
                            <TableCell align="center">삭제 여부</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {coupons.map((coupon, idx) => (
                            <TableRow
                                key={coupon.id}
                                hover
                                onClick={() => handleRowClick(coupon)}
                                sx={{ cursor: 'pointer' }}
                            >
                                <TableCell align="center">{idx + 1}</TableCell>
                                <TableCell align="center">{coupon.name}</TableCell>
                                <TableCell align="center">{dayjs(coupon.createAt).format('YYYY-MM-DD')}</TableCell>
                                <TableCell align="center">{`${dayjs(coupon.startDate).format('YYYY-MM-DD')} ~ ${dayjs(coupon.expiryDate).format('YYYY-MM-DD')}`}</TableCell>
                                <TableCell align="center">{coupon.useCount}</TableCell>
                                <TableCell align="center">
                                    <Checkbox checked={coupon.isActive} disabled/>
                                </TableCell>
                                <TableCell align="center">
                                    <Button
                                        variant="outlined"
                                        color="error"
                                        size="small"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            openDeleteModal(coupon.id);
                                        }}
                                    >
                                        삭제
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
            <EventModal
                open={openModal}
                onClose={() => {
                    setOpenModal(false);
                    setCouponToEdit(null);
                }}
                onSuccess={fetchCoupons}
                couponToEdit={couponToEdit}
            />
            <ConfirmDialog
                open={openConfirm}
                onClose={() => setOpenConfirm(false)}
                onConfirm={handleDelete}
            />
        </div>
    );
};

export default Event;