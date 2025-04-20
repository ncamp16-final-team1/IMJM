import React from 'react';
import { Container, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Avatar, Button } from '@mui/material';

const reservations = [
  { name: '@venus.sys', designer: '원터 원장', menu: '앞머리 컷트', amount: '12,000원', time: '09:00', status: '예약 취소' },
  { name: 'Robert Bacins', designer: '뷔 실장', menu: '디지털 펌', amount: '87,000원', time: '09:00', status: '완료' },
  { name: 'John Carilo', designer: '원영 디자이너', menu: '남성 컷트', amount: '20,000원', time: '10:30', status: '변경' },
  { name: 'Adriene Watson', designer: '혜원 디자이너', menu: '앞머리 펌', amount: '매장에서 결제', time: '10:30', status: '변경' },
  { name: 'Jhon Deo', designer: '원터 원장', menu: '베이직 염색', amount: '110,000원', time: '12:00', status: '변경' },
  { name: 'Mark Ruffalo', designer: '뷔 실장', menu: '여성 컷트', amount: '30,000원', time: '13:30', status: '변경' },
  { name: 'Bethany Jackson', designer: '원터 원장', menu: '볼륨 매직', amount: '80,000원', time: '14:00', status: '변경' },
  { name: 'Christine Huston', designer: '원영 디자이너', menu: '디자인 펌', amount: '170,000원', time: '15:00', status: '변경' },
  { name: 'Anne Jacob', designer: '유진 디자이너', menu: '여성 컷트', amount: '30,000원', time: '15:30', status: '변경' },
];

const Reservation = () => {
  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        예약 현황
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>이름</TableCell>
              <TableCell>디자이너</TableCell>
              <TableCell>메뉴</TableCell>
              <TableCell>결제금액</TableCell>
              <TableCell>예약시간</TableCell>
              <TableCell>상태</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {reservations.map((reservation, index) => (
              <TableRow key={index}>
                <TableCell>
                  <Avatar src={`https://i.pravatar.cc/150?img=${index + 1}`} />
                  {reservation.name}
                </TableCell>
                <TableCell>{reservation.designer}</TableCell>
                <TableCell>{reservation.menu}</TableCell>
                <TableCell>{reservation.amount}</TableCell>
                <TableCell>{reservation.time}</TableCell>
                <TableCell>
                  <Button variant="contained" color={reservation.status === '완료' ? 'success' : 'error'}>
                    {reservation.status}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default Reservation;