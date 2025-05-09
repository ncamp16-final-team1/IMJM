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
import AdminChatService, { ChatRoom } from '../../service/chat/AdminChatService';
import AdminWebSocketService from '../../service/chat/AdminWebSocketService';
import styles from './ChatRoom.module.css';
import axios from 'axios';

const AdminChatList: React.FC<{ onSelectRoom: (roomId: number, userId: string) => void }> = ({ onSelectRoom }) => {
    const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const navigate = useNavigate();
    const [salonId, setSalonId] = useState<string | null>(null);

    useEffect(() => {
        const fetchSalonAndChatRooms = async () => {
            try {
                const salonResponse = await axios.get('/api/admin/salons/my');
                const currentSalonId = salonResponse.data.id;
                setSalonId(currentSalonId);

                AdminWebSocketService.initialize(currentSalonId);

                const rooms = await AdminChatService.getSalonChatRooms();
                setChatRooms(rooms);
                setLoading(false);
            } catch (error) {
                console.error('미용실 정보 또는 채팅방 목록을 불러오는데 실패했습니다:', error);
                setLoading(false);
            }
        };

        fetchSalonAndChatRooms();

        const handleNewMessage = async () => {
            try {
                const rooms = await AdminChatService.getSalonChatRooms();
                setChatRooms(rooms);
            } catch (error) {
                console.error('채팅방 목록 업데이트 실패:', error);
            }
        };

        const handleMessageRead = async (roomId: number) => {
            try {
                setChatRooms(prevRooms =>
                    prevRooms.map(room =>
                        room.id === roomId
                            ? { ...room, unreadCount: 0, hasUnreadMessages: false }
                            : room
                    )
                );
            } catch (error) {
                console.error('채팅방 읽음 상태 업데이트 실패:', error);
            }
        };

        if (salonId) {
            AdminWebSocketService.addListener('message', handleNewMessage);
            AdminWebSocketService.addListener('message-read', handleMessageRead);
        }

        return () => {
            if (salonId) {
                AdminWebSocketService.removeListener('message', handleNewMessage);
                AdminWebSocketService.removeListener('message-read', handleMessageRead);
            }
        };
    }, [salonId]);

    const handleChatRoomClick = (roomId: number, userId: string) => {
        onSelectRoom(roomId, userId);
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
                                    <Avatar
                                        alt={room.userName}
                                        src={room.userProfileUrl}
                                        sx={{
                                            bgcolor: !room.userProfileUrl ? '#FF9080' : undefined
                                        }}
                                    >
                                        {!room.userProfileUrl && room.userName ? room.userName.charAt(0) : ''}
                                    </Avatar>
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

export default AdminChatList;