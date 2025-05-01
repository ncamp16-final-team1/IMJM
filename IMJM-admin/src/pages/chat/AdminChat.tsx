import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Box, Typography } from '@mui/material';
import AdminChatList from './AdminChatList';
import AdminChatRoom from './AdminChatRoom';

function AdminChat() {
    return (
        <Box sx={{ p: 3, width: '100%' }}>
            <Typography variant="h5" fontWeight="bold" mb={3}>채팅 관리</Typography>
            <Routes>
                <Route index element={<AdminChatList />} />
                <Route path=":roomId/:userId" element={<AdminChatRoom />} />
                <Route path="*" element={<Navigate to="." replace />} />
            </Routes>
        </Box>
    );
}

export default AdminChat;