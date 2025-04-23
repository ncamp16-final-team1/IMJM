import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ChatList from './ChatList';
import ChatRoom from './ChatRoom';
import { Box, Typography } from '@mui/material';

function Chat() {
    return (
        <Box sx={{ p: 3, width: '100%' }}>
            <Typography variant="h5" fontWeight="bold" mb={3}>채팅 관리</Typography>
            <Routes>
                <Route index element={<ChatList />} />
                <Route path=":roomId/:userId" element={<ChatRoom />} />
                <Route path="*" element={<Navigate to="." replace />} />
            </Routes>
        </Box>
    );
}

export default Chat;