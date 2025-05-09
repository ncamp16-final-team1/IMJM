import React, { useEffect, useState } from "react";
import axios from "axios";
import AdminChatService, { ChatRoom } from "../../service/chat/AdminChatService";

import {
  Grid, Card, CardContent, Typography, Box, Divider, List,
  ListItem, ListItemText
} from "@mui/material";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend
} from "recharts";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [todayReservations, setTodayReservations] = useState([]);
  const [weeklyData, setWeeklyData] = useState({});
  const [monthlyData, setMonthlyData] = useState({});
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [chatLoading, setChatLoading] = useState<boolean>(true);

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
    fetchChatRooms();
  }, []);

  const fetchChatRooms = async () => {
    try {
      setChatLoading(true);
      const rooms = await AdminChatService.getSalonChatRooms();
      // 최근 메시지 기준으로 정렬 (lastMessageTime 기준)
      const sortedRooms = rooms.sort((a, b) =>
          new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime()
      );
      // 최대 5개만 표시
      setChatRooms(sortedRooms.slice(0, 5));
      setChatLoading(false);
    } catch (error) {
      console.error("채팅방 목록 불러오기 실패:", error);
      setChatLoading(false);
    }
  };

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

  // 시간 포맷팅 함수
  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffDay > 0) return `${diffDay}일 전`;
    if (diffHour > 0) return `${diffHour}시간 전`;
    if (diffMin > 0) return `${diffMin}분 전`;
    return '방금 전';
  };

  // 채팅방으로 이동하는 함수
  const handleChatRoomClick = (roomId: number, userId: string) => {
    navigate('/chat', { state: { initialRoomId: roomId, initialUserId: userId } });
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
                <Typography variant="h6" onClick={() => handleClick('/chat')} style={{ cursor: 'pointer' }}>
                  채팅 ({chatRooms.length})
                </Typography>
                <Divider sx={{ my: 1 }} />
                {chatLoading ? (
                    <Box display="flex" justifyContent="center" alignItems="center" height="200px">
                      <Typography>로딩 중...</Typography>
                    </Box>
                ) : chatRooms.length === 0 ? (
                    <Box display="flex" justifyContent="center" alignItems="center" height="200px">
                      <Typography>채팅 내역이 없습니다.</Typography>
                    </Box>
                ) : (
                    <List>
                      {chatRooms.map((room) => (
                          <ListItem
                              key={room.id}
                              divider
                              button
                              onClick={() => handleChatRoomClick(room.id, room.userId)}
                              sx={{ cursor: 'pointer', '&:hover': { backgroundColor: 'rgba(0,0,0,0.04)' } }}
                          >
                            <ListItemText
                                primary={room.userName}
                                secondary={room.lastMessage || "(메시지 없음)"}
                            />
                            <Typography variant="body2">
                              {formatTimeAgo(room.lastMessageTime)}
                            </Typography>
                            {room.unreadCount > 0 && (
                                <Box
                                    sx={{
                                      ml: 1,
                                      bgcolor: '#FF9080',
                                      color: 'white',
                                      borderRadius: '50%',
                                      width: 24,
                                      height: 24,
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      fontSize: '0.75rem'
                                    }}
                                >
                                  {room.unreadCount}
                                </Box>
                            )}
                          </ListItem>
                      ))}
                    </List>
                )}
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