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
import { useNavigate } from "react-router-dom";

const chats = [
  { user: "홍길동", message: "예약 시간 변경 가능한가요?", time: "1분 전" },
];

function Dashboard() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [todayReservations, setTodayReservations] = useState([]);
  const [weeklyData, setWeeklyData] = useState({});
  const [monthlyData, setMonthlyData] = useState({});

  const navigate = useNavigate();

  useEffect(() => {
    axios.get("/api/admin/dashboard/reservation", { withCredentials: true })
      .then(res => setTodayReservations(res.data))
      .catch(err => console.error("예약 정보 불러오기 실패", err));

    axios.get("/api/admin/reservation/stats", { withCredentials: true })
      .then(res => {
        setWeeklyData(res.data.weekly);
        setMonthlyData(res.data.monthly);
      })
      .catch(err => console.error("예약 통계 불러오기 실패", err));

    fetchReviews();
  }, []);

  const days = ["월", "화", "수", "목", "금", "토", "일"];

  const chartData = days.map(day => ({
    day,
    주간: weeklyData[day] || 0,
    월간: monthlyData[day] || 0,
  }));

  const fetchReviews = async () => {
    try {
      const response = await axios.get("/api/admin/review/list", {
        withCredentials: true,
      });
      setReviews(response.data);
    } catch (error) {
      console.error("리뷰 목록 불러오기 실패:", error);
    }
  };

  const handleClick = (path) => {
    navigate(path);
  };

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
              <Typography variant="h6" onClick={() => handleClick('/reservation')} style={{ cursor: 'pointer' }}>
                오늘 예약 현황 ({todayReservations.length})
              </Typography>
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
              <Typography variant="h6" onClick={() => handleClick('/review')} style={{ cursor: 'pointer' }}>
                리뷰 관리 ({reviews.length})
              </Typography>
              <Divider sx={{ my: 1 }} />
              <Box component="table" width="100%" sx={{ fontSize: 14 }}>
                <thead>
                  <tr>
                    <th align="left">고객명(닉네임)</th>
                    <th align="center">작성 날짜</th>
                    <th align="center">답변여부</th>
                  </tr>
                </thead>
                <tbody>
                  {reviews.map((r, index) => (
                    <tr key={index}>
                      <td align="left">{r.userName}({r.nickName})</td>
                      <td align="center">{new Date(r.regDate).toLocaleDateString()}</td>
                      <td align="center">{r.answered ? "✔️" : "—"}</td>
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