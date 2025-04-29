import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ChatList from './ChatList';
import ChatRoom from './ChatRoom';
import styles from './ChatMain.module.css';

const ChatMain: React.FC = () => {
    return (
        <div className={styles.container}>
            <Routes>
                <Route index element={<ChatList />} />
                <Route path=":roomId" element={<ChatRoom />} />
                <Route path="*" element={<Navigate to="/chat" replace />} />
            </Routes>
        </div>
    );
};

export default ChatMain;