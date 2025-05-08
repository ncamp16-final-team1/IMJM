import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    List,
    ListItem,
    ListItemText,
    ListItemAvatar,
    Avatar,
    Divider,
    Box,
    Typography,
    CircularProgress
} from '@mui/material';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import styles from './ChatList.module.css';
import ChatService, { ChatRoom } from '../../services/chat/ChatService';
import WebSocketService from '../../services/chat/WebSocketService';

const ChatList: React.FC = () => {
    const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const [userId, setUserId] = useState<string | null>(null);

    useEffect(() => {
        const fetchUserAndChatRooms = async () => {
            try {
                // 현재 로그인된 사용자 정보 가져오기
                const userResponse = await axios.get('/api/chat/user/current');
                const currentUserId = userResponse.data.id;
                setUserId(currentUserId);

                // WebSocket 연결 초기화
                WebSocketService.initialize(currentUserId);

                // 채팅방 목록 가져오기
                const rooms = await ChatService.getUserChatRooms();
                setChatRooms(rooms);
                setLoading(false);
            } catch (error) {
                console.error('사용자 정보 또는 채팅방 목록을 불러오는데 실패했습니다:', error);
                setLoading(false);
            }
        };

        fetchUserAndChatRooms();

        // 새 메시지 수신 시 채팅방 목록 업데이트
        const handleNewMessage = async () => {
            try {
                const rooms = await ChatService.getUserChatRooms();
                setChatRooms(rooms);
            } catch (error) {
                console.error('채팅방 목록 업데이트 실패:', error);
            }
        };

        if (userId) {
            WebSocketService.addListener('message', handleNewMessage);
        }

        return () => {
            if (userId) {
                WebSocketService.removeListener('message', handleNewMessage);
            }
        };
    }, [userId]);

    const handleChatRoomClick = (roomId: number, salonId: string) => {
        navigate(`/chat/${roomId}`);
    };

    if (loading) {
        return (
            <div className={styles.loading}>
                <CircularProgress size={40} />
                <Typography sx={{ ml: 2 }}>채팅방 목록을 불러오는 중...</Typography>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <Typography variant="h6">Recent Chats</Typography>
            </div>

            <List sx={{ width: '100%', padding: 0 }}>
                {chatRooms.length === 0 ? (
                    <div className={styles.noChatsMessage}>
                        <Typography>아직 채팅 내역이 없습니다.</Typography>
                    </div>
                ) : (
                    chatRooms.map((room) => (
                        <React.Fragment key={room.id}>
                            <ListItem
                                onClick={() => handleChatRoomClick(room.id, room.salonId)}
                                sx={{
                                    cursor: 'pointer',
                                    '&:hover': {
                                        backgroundColor: 'rgba(0,0,0,0.04)'
                                    }
                                }}
                            >
                                <ListItemAvatar>
                                    <Avatar
                                        alt={room.salonName}
                                        src={room.salonProfileUrl}
                                        sx={{
                                            bgcolor: !room.salonProfileUrl ? '#FF9080' : undefined
                                        }}
                                    >
                                        {!room.salonProfileUrl && room.salonName ? room.salonName.charAt(0) : ''}
                                    </Avatar>
                                </ListItemAvatar>
                                <ListItemText
                                    primary={
                                        <Box className={styles.roomHeader}>
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                <Typography component="span" className={styles.salonName}>
                                                    {room.salonName}
                                                </Typography>
                                                {room.unreadCount > 0 && (
                                                    <Box className={styles.unreadBadge}>
                                                        {room.unreadCount}
                                                    </Box>
                                                )}
                                            </Box>
                                        </Box>
                                    }
                                    secondary={
                                        <Typography
                                            component="span"
                                            className={styles.lastMessage}
                                            noWrap
                                        >
                                            {room.lastMessage}
                                        </Typography>
                                    }
                                />
                                <Typography component="span" className={styles.messageTime}>
                                    {new Date(room.lastMessageTime).toLocaleTimeString([], {
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </Typography>
                                <KeyboardArrowRightIcon color="action" />
                            </ListItem>
                            <Divider variant="inset" component="li" />
                        </React.Fragment>
                    ))
                )}
            </List>
        </div>
    );
};

export default ChatList;