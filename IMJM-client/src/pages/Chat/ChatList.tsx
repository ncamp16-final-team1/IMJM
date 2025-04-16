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
    Box
} from '@mui/material';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import styles from './ChatList.module.css';

// 채팅방 타입 정의
interface ChatRoom {
    id: number;
    salonId: string;
    salonName: string;
    lastMessage: string;
    lastMessageTime: string;
    unreadCount: number;
}

const ChatList: React.FC = () => {
    const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        // 채팅방 목록을 가져오는 API 호출 대신 임시 데이터
        const fetchChatRooms = async () => {
            try {
                // 임시 데이터
                const mockChatRooms: ChatRoom[] = [
                    {
                        id: 1,
                        salonId: 'salonA',
                        salonName: 'Salon A',
                        lastMessage: '안녕하세요! 예약 확인해 드렸습니다.',
                        lastMessageTime: '10:23',
                        unreadCount: 2
                    },
                    {
                        id: 2,
                        salonId: 'salonB',
                        salonName: 'Salon B',
                        lastMessage: 'We will be expecting you tomorrow.',
                        lastMessageTime: '어제',
                        unreadCount: 0
                    },
                    {
                        id: 3,
                        salonId: 'salonC',
                        salonName: 'Salon C',
                        lastMessage: 'How about 3pm?',
                        lastMessageTime: '어제',
                        unreadCount: 0
                    },
                    {
                        id: 4,
                        salonId: 'salonD',
                        salonName: 'Salon D',
                        lastMessage: '감사합니다! 내일 뵙겠습니다.',
                        lastMessageTime: '5월 20일',
                        unreadCount: 0
                    },
                ];

                setChatRooms(mockChatRooms);
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
        return <div className={styles.loading}>채팅방 목록을 불러오는 중...</div>;
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
                                    {room.lastMessageTime}
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