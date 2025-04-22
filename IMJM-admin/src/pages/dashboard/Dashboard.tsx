import React, { useEffect, useState } from "react";
import axios from "axios";

import {
    Grid, Card, CardContent, Typography, Box, Divider, List,
    ListItem, ListItemText
} from "@mui/material";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    Legend
} from "recharts";

const chats = [
    { user: "홍길동", message: "예약 시간 변경 가능한가요?", time: "1분 전" },
];

const reviews = [
    { user: "신동역", date: "2025-03-21", answered: true },
    { user: "임성철", date: "2025-03-22", answered: false },
];

const chartData = [
    { day: "월", 주간: 45, 월간: 25 },
    { day: "화", 주간: 30, 월간: 20 },
    { day: "수", 주간: 35, 월간: 30 },
    { day: "목", 주간: 45, 월간: 35 },
    { day: "금", 주간: 15, 월간: 10 },
    { day: "토", 주간: 40, 월간: 28 },
    { day: "일", 주간: 38, 월간: 27 },
];

function Dashboard() {
    const [todayReservations, setTodayReservations] = useState([]);

    useEffect(() => {
        axios.get("/api/admin/dashboard/reservation")
            .then(res => setTodayReservations(res.data))
            .catch(err => console.error("예약 정보 불러오기 실패", err));
    }, []);

    return (
        <Box width={950} height={780} p={3} mx="auto">
            <Typography variant="h4" gutterBottom>대시보드</Typography>

            <Grid container spacing={5}>
                {/* 오늘 예약 현황 */}
                <Grid item>
                    <Card
                        sx={{
                            width: 450,
                            height: 310,
                            boxShadow: "none",
                            border: "2px solid #FF9080",
                            borderRadius: "10px"
                        }}
                    >
                        <CardContent>
                            <Typography variant="h6">오늘 예약 현황 ({todayReservations.length})</Typography>
                            <Divider sx={{ my: 1 }} />
                            <Box component="table" width="100%" sx={{ fontSize: 14 }}>
                                <thead>
                                    <tr>
                                        <th align="center">이름</th>
                                        <th align="center">메뉴</th>
                                        <th align="center">예약 시간</th>
                                        <th align="center">디자이너</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {todayReservations.map((r, index) => (
                                        <tr key={index}>
                                            <td align="center">{r.userName}</td>
                                            <td align="center">{r.serviceName}</td>
                                            <td align="center">{r.reservationTime}</td>
                                            <td align="center">{r.stylistName}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* 예약 통계 */}
                <Grid item>
                <Card
                        sx={{
                            width: 450,
                            height: 310,
                            boxShadow: "none",
                            border: "2px solid #FF9080",
                            borderRadius: "10px"
                        }}
                    >
                        <CardContent>
                            <Typography variant="h6">예약 통계</Typography>
                            <Divider sx={{ my: 1 }} />
                            <Box width="100%" height={200}>
                                <BarChart width={400} height={200} data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="day" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="주간" fill="#3f51b5" />
                                    <Bar dataKey="월간" fill="#ce93d8" />
                                </BarChart>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* 채팅 */}
                <Grid item>
                <Card
                        sx={{
                            width: 450,
                            height: 310,
                            boxShadow: "none",
                            border: "2px solid #FF9080",
                            borderRadius: "10px"
                        }}
                    >
                        <CardContent>
                            <Typography variant="h6">채팅 ({chats.length})</Typography>
                            <Divider sx={{ my: 1 }} />
                            <List>
                                {chats.map((chat, index) => (
                                    <ListItem key={index} divider>
                                        <ListItemText primary={chat.user} secondary={chat.message} />
                                        <Typography variant="body2">{chat.time}</Typography>
                                    </ListItem>
                                ))}
                            </List>
                        </CardContent>
                    </Card>
                </Grid>

                {/* 리뷰 관리 */}
                <Grid item>
                <Card
                        sx={{
                            width: 450,
                            height: 310,
                            boxShadow: "none",
                            border: "2px solid #FF9080",
                            borderRadius: "10px"
                        }}
                    >
                        <CardContent>
                            <Typography variant="h6">리뷰 관리 ({reviews.length})</Typography>
                            <Divider sx={{ my: 1 }} />
                            <Box component="table" width="100%" sx={{ fontSize: 14 }}>
                                <thead>
                                    <tr>
                                        <th align="left">작성자(고객명)</th>
                                        <th align="left">작성 날짜</th>
                                        <th align="left">답변여부</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {reviews.map((r, index) => (
                                        <tr key={index}>
                                            <td>{r.user}</td>
                                            <td>{r.date}</td>
                                            <td>{r.answered ? "✔️" : "—"}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
}

export default Dashboard;