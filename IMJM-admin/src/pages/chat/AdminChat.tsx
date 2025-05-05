import React, { useState, useEffect } from 'react';
import { Box, Typography, Divider } from '@mui/material';
import AdminChatList from './AdminChatList';
import AdminChatRoom from './AdminChatRoom';
import { useLocation } from 'react-router-dom';

function AdminChat() {
    const location = useLocation();
    const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
    const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

    // location.state에서 초기 채팅방 ID와 사용자 ID를 가져옴
    useEffect(() => {
        if (location.state) {
            const { initialRoomId, initialUserId } = location.state as any;
            if (initialRoomId && initialUserId) {
                setSelectedRoomId(initialRoomId);
                setSelectedUserId(initialUserId);
            }
        }
    }, [location.state]);

    return (
        <Box sx={{ display: 'flex', width: '100%', height: 'calc(100vh - 100px)', p: 2, gap: 2 }}>
            {/* 좌측 채팅 목록 */}
            <Box sx={{ width: '30%', overflowY: 'auto' }}>
                <Typography variant="h6" fontWeight="bold" mb={2}>채팅 목록</Typography>
                <AdminChatList
                    onSelectRoom={(roomId, userId) => {
                        setSelectedRoomId(roomId);
                        setSelectedUserId(userId);
                    }}
                />
            </Box>

            <Divider orientation="vertical" flexItem />

            {/* 우측 채팅방 */}
            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                {selectedRoomId && selectedUserId ? (
                    <AdminChatRoom roomId={selectedRoomId} userId={selectedUserId} />
                ) : (
                    <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Typography color="text.secondary">채팅방을 선택해주세요.</Typography>
                    </Box>
                )}
            </Box>
        </Box>
    );
}

export default AdminChat;