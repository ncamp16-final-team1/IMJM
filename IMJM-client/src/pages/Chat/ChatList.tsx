import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    List,
    ListItem,
    ListItemText,
    ListItemAvatar,
    Avatar,
    Typography,
    Divider,
    Box,
    CircularProgress
} from '@mui/material';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import styles from './ChatList.module.css';
import ChatService, { ChatRoom } from '../../services/chat/ChatService';

const ChatList: React.FC = () => {
    const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchChatRooms = async () => {
            try {
                // 현재 로그인한 사용자 ID (실제로는 인증 서비스에서 가져와야 함)
                const userId = 'user2'; // 테스트용 사용자 ID
                const rooms = await ChatService.getUserChatRooms(userId);
                setChatRooms(rooms);
                setLoading(false);
            } catch (error) {
                console.error('채팅방 목록을 불러오는데 실패했습니다:', error);
                setLoading(false);
            }
        };

        fetchChatRooms();
    }, []);

    const handleChatRoomClick = (roomId: number, salonId: string) => {
        navigate(`/chat/${roomId}/${salonId}`);
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
                                    <Avatar alt={room.salonName} />
                                </ListItemAvatar>
                                <ListItemText
                                    primary={
                                        <Box className={styles.roomHeader}>
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                <Typography component="span" className={styles.salonName}>
                                                    {room.salonName}
                                                </Typography>
                                                {room.unreadCount > 0 && (
                                                    <Box
                                                        className={styles.unreadBadge}
                                                        sx={{
                                                            ml: 1,
                                                        }}
                                                    >
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