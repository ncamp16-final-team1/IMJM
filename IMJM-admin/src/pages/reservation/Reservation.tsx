import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
    Container,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Avatar,
    Stack,
    CircularProgress,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    IconButton,
} from '@mui/material';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs, { Dayjs } from 'dayjs';

interface AdminReservationDto {
    id: number;
    reservationId: number;
    userId: string;
    userName: string;
    userProfile: string;
    stylistName: string;
    serviceName: string;
    paymentPrice: number;
    reservationDate: string;
    reservationTime: string;
}

const Reservation = () => {
    const [reservations, setReservations] = useState<AdminReservationDto[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());

    const [open, setOpen] = useState(false);
    const [selectedReservation, setSelectedReservation] = useState<AdminReservationDto | null>(null);
    const [newDate, setNewDate] = useState<Dayjs | null>(null);
    const [newTime, setNewTime] = useState<Dayjs | null>(null);

    const fetchReservations = (date: string) => {
        setLoading(true);
        axios
            .get(`/api/admin/reservation?date=${date}`)
            .then((res) => setReservations(res.data))
            .catch((err) => console.error('예약 데이터 로딩 실패:', err))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchReservations(selectedDate.format('YYYY-MM-DD'));
    }, [selectedDate]);

    const handleTodayClick = () => {
        setSelectedDate(dayjs());
    };

    const handleOpenModal = (Reservation: AdminReservationDto) => {
        setSelectedReservation(Reservation);
        setNewDate(dayjs(Reservation.reservationDate));
        const timeParts = Reservation.reservationTime.split(":");
        const time = dayjs()
            .hour(parseInt(timeParts[0]))
            .minute(parseInt(timeParts[1]));
        
        setNewTime(time);
        setOpen(true);
    };

    const handleCloseModal = () => {
        setOpen(false);
        setSelectedReservation(null);
    };

    const handleUpdateReservation = () => {
        if (!selectedReservation || !newDate || !newTime) return;

        const formattedDate = newDate.format("YYYY-MM-DD");
        const formattedTime = newTime.format("HH:mm:ss");

        axios
            .put(`/api/admin/reservation/${selectedReservation.id}`, {
                reservationDate: formattedDate,
                reservationTime: formattedTime,
            })
            .then(() => {
                setSelectedDate(newDate);
                fetchReservations(newDate.format("YYYY-MM-DD"));
                handleCloseModal();
            })
            .catch((err) => console.error("예약 변경 실패", err));
    };

    return (
        <Container>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mt={3}>
                <Typography variant="h5" fontWeight="bold">
                    예약 현황
                </Typography>
                <Stack direction="row" spacing={2} alignItems="center">
                    <IconButton onClick={() => setSelectedDate(prev => prev.subtract(1, 'day'))}>
                        <ChevronLeft />
                    </IconButton>

                    <DatePicker
                        label="날짜 선택"
                        value={selectedDate}
                        onChange={(newValue) => newValue && setSelectedDate(newValue)}
                        format="YYYY-MM-DD"
                        slotProps={{ textField: { size: 'small' } }}
                    />

                    <IconButton onClick={() => setSelectedDate(prev => prev.add(1, 'day'))}>
                        <ChevronRight />
                    </IconButton>

                    <Button variant="outlined" size="small" onClick={handleTodayClick}>
                        오늘
                    </Button>
                </Stack>
            </Stack>

            <Typography variant="subtitle1" align="right" color="gray" gutterBottom mt={1}>
                선택된 날짜: {selectedDate.format('YYYY-MM-DD')}
            </Typography>

            {loading ? (
                <Stack alignItems="center" mt={5}>
                    <CircularProgress />
                </Stack>
            ) : (
                <TableContainer component={Paper} elevation={0} sx={{ height: 700 }}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>예약자</TableCell>
                                <TableCell align="center">디자이너</TableCell>
                                <TableCell align="center">메뉴</TableCell>
                                <TableCell align="center">결제금액</TableCell>
                                <TableCell align="center">예약시간</TableCell>
                                <TableCell align="center">상태</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {reservations.map((res) => {
                                const now = dayjs();
                                const resDateTime = dayjs(`${res.reservationDate} ${res.reservationTime}`);
                                const isFuture = resDateTime.isAfter(now);

                                return (
                                    <TableRow key={res.id}>
                                        <TableCell align="center">
                                            <Stack direction="row" alignItems="center" spacing={1}>
                                                <Avatar src={res.userProfile} alt={res.userName} />
                                                <span>{res.userName}</span>
                                            </Stack>
                                        </TableCell>
                                        <TableCell align="center">{res.stylistName}</TableCell>
                                        <TableCell align="center">{res.serviceName}</TableCell>
                                        <TableCell align="center">{res.paymentPrice.toLocaleString()}원</TableCell>
                                        <TableCell align="center">{resDateTime.format("HH:mm")}</TableCell>
                                        <TableCell align="center">
                                            {isFuture ? (
                                                <Button variant="outlined" size="small" onClick={() => handleOpenModal(res)}>
                                                    일정 변경
                                                </Button>
                                            ) : (
                                                <Button variant="outlined" size="small" disabled>
                                                    완료
                                                </Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            <Dialog open={open} onClose={handleCloseModal}>
                <DialogTitle>예약 변경</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} mt={1}>
                        <DatePicker
                            label="날짜"
                            value={newDate}
                            onChange={(newValue) => newValue && setNewDate(newValue)}
                            format="YYYY-MM-DD"
                        />
                        <TextField
                            label="예약 시간"
                            type="time"
                            value={newTime?.format("HH:mm") ?? ""}
                            onChange={(e) => setNewTime(dayjs(e.target.value, "HH:mm"))}
                            InputLabelProps={{
                                shrink: true,
                            }}
                            inputProps={{
                                step: 300, // 5분 단위
                            }}
                        />
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseModal}>취소</Button>
                    <Button variant="contained" color="secondary" onClick={handleUpdateReservation}>
                        변경 완료
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default Reservation;