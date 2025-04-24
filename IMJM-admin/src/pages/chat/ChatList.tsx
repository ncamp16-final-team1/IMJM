import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Typography,
    List,
    ListItem,
    ListItemText,
    ListItemAvatar,
    Avatar,
    Divider,
    CircularProgress,
    Paper
} from '@mui/material';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import axios from 'axios';

// ChatRoom 타입 정의
interface ChatRoom {
    id: number;
    userId: string;
    userName: string;
    lastMessage: string;
    lastMessageTime: string;
    unreadCount: number;
}

const ChatList: React.FC = () => {
    const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchChatRooms = async () => {
            try {
                // 쿠키로부터 미용실 ID를 가져오는 로직
                // 실제 구현에서는 다음과 같이 쿠키를 파싱하는 로직이 필요합니다
                const cookies = document.cookie.split(';').reduce((acc, cookie) => {
                    const [key, value] = cookie.trim().split('=');
                    acc[key] = value;
                    return acc;
                }, {} as Record<string, string>);

                // AdminToken에서 ID를 추출하는 로직
                // 여기서는 임시로 JWT 토큰에서 salonId를 추출한다고 가정합니다
                const token = cookies.AdminToken;
                // 실제로는 JWT 디코딩 또는 API 호출로 salonId를 가져와야 합니다
                // 여기서는 예시로 API를 호출하는 방식을 사용합니다

                const response = await axios.get('/api/admin/salons/my');
                const salonId = response.data.id;

                // 채팅방 목록 가져오기
                const roomsResponse = await axios.get(`/api/chat/rooms/salon/${salonId}`);
                setChatRooms(roomsResponse.data);
                setLoading(false);
            } catch (error) {
                console.error('채팅방 목록을 불러오는데 실패했습니다:', error);
                setLoading(false);
            }
        };

        fetchChatRooms();
    }, []);

    const handleChatRoomClick = (roomId: number, userId: string) => {
        navigate(`/chat/${roomId}/${userId}`);  // 소문자 'chat'으로 변경
    };

    const formatTimeToDisplay = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', p: 3 }}>
                <CircularProgress size={40} />
                <Typography sx={{ ml: 2 }}>채팅방 목록을 불러오는 중...</Typography>
            </Box>
        );
    }

    return (
        <Paper elevation={2} sx={{ width: '90%', borderRadius: 2, overflow: 'hidden' }}>
            <List sx={{ width: '100%', padding: 0 }}>
                {chatRooms.length === 0 ? (
                    <Box sx={{ p: 3, textAlign: 'center' }}>
                        <Typography color="text.secondary">채팅 내역이 없습니다.</Typography>
                    </Box>
                ) : (
                    chatRooms.map((room) => (
                        <React.Fragment key={room.id}>
                            <ListItem
                                onClick={() => handleChatRoomClick(room.id, room.userId)}
                                sx={{
                                    cursor: 'pointer',
                                    py: 2,
                                    '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' }
                                }}
                            >
                                <ListItemAvatar>
                                    <Avatar alt={room.userName} />
                                </ListItemAvatar>
                                <ListItemText
                                    primary={
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <Typography fontWeight="bold">{room.userName}</Typography>
                                            {room.unreadCount > 0 && (
                                                <Box
                                                    sx={{
                                                        ml: 1,
                                                        bgcolor: '#FF9080',
                                                        color: 'white',
                                                        borderRadius: '50%',
                                                        width: 20,
                                                        height: 20,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        fontSize: '0.75rem'
                                                    }}
                                                >
                                                    {room.unreadCount}
                                                </Box>
                                            )}
                                        </Box>
                                    }
                                    secondary={
                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                            noWrap
                                            sx={{ maxWidth: 250 }}
                                        >
                                            {room.lastMessage || '(메시지 없음)'}
                                        </Typography>
                                    }
                                />
                                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', ml: 'auto' }}>
                                    <Typography variant="caption" color="text.secondary">
                                        {formatTimeToDisplay(room.lastMessageTime)}
                                    </Typography>
                                    <KeyboardArrowRightIcon color="action" sx={{ mt: 1 }} />
                                </Box>
                            </ListItem>
                            <Divider />
                        </React.Fragment>
                    ))
                )}
            </List>
        </Paper>
    );
};

export default ChatList;