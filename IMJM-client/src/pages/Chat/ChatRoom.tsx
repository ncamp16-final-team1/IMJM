import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Typography,
    IconButton,
    Avatar,
    TextField,
    Paper,
    InputAdornment,
    CircularProgress
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SendIcon from '@mui/icons-material/Send';
import MicIcon from '@mui/icons-material/Mic';
import styles from './ChatRoom.module.css';
import ChatService, { ChatMessage } from '../../services/chat/ChatService';
import WebSocketService from '../../services/chat/WebSocketService';

interface ChatRoomInfo {
    id: number;
    salonId: string;
    salonName: string;
    userLanguage: string;
    salonLanguage: string;
}

const ChatRoom: React.FC = () => {
    const { roomId, salonId } = useParams<{ roomId: string; salonId: string }>();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState<string>('');
    const [chatRoom, setChatRoom] = useState<ChatRoomInfo | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();
    const [userId] = useState<string>('user1'); // 테스트용 사용자 ID (실제로는 인증 서비스에서 가져와야 함)

    // 웹소켓 연결 및 메시지 수신 설정
    useEffect(() => {
        // 웹소켓 초기화
        WebSocketService.initialize(userId);

        // 메시지 수신 리스너 등록
        const handleNewMessage = (messageData: ChatMessage) => {
            if (messageData.chatRoomId === Number(roomId)) {
                setMessages(prev => {
                    // 이미 같은 메시지가 있는지 확인 (임시 ID로 추가한 메시지)
                    const messageExists = prev.some(msg =>
                        msg.message === messageData.message &&
                        msg.senderType === messageData.senderType &&
                        Math.abs(new Date(msg.sentAt).getTime() - new Date(messageData.sentAt).getTime()) < 5000
                    );

                    if (messageExists) {
                        // 기존 메시지를 새 메시지로 업데이트
                        return prev.map(msg =>
                            msg.message === messageData.message &&
                            msg.senderType === messageData.senderType &&
                            Math.abs(new Date(msg.sentAt).getTime() - new Date(messageData.sentAt).getTime()) < 5000
                                ? messageData : msg
                        );
                    } else {
                        // 새 메시지 추가
                        return [...prev, messageData];
                    }
                });
            }
        };

        WebSocketService.addListener('message', handleNewMessage);

        // 컴포넌트 언마운트 시 리스너 제거 및 연결 해제
        return () => {
            WebSocketService.removeListener('message', handleNewMessage);
        };
    }, [userId, roomId]);

    // 채팅방 정보와 메시지 로드
    useEffect(() => {
        const fetchChatRoom = async () => {
            try {
                if (!roomId) return;

                // 채팅방 정보를 서버에서 가져오는 API가 없어서 간단한 정보로 대체
                setChatRoom({
                    id: Number(roomId),
                    salonId: salonId || '',
                    salonName: 'Beauty Salon', // 실제로는 API에서 받아와야 함
                    userLanguage: 'en', // 사용자 언어
                    salonLanguage: 'ko', // 미용실 언어
                });

                // 채팅 메시지 로드
                const chatMessages = await ChatService.getChatMessages(Number(roomId));
                setMessages(chatMessages);

                // 메시지 읽음 처리
                await ChatService.markMessagesAsRead(Number(roomId), 'USER');

                setLoading(false);
            } catch (err) {
                console.error('채팅방 정보를 불러오는데 실패했습니다:', err);
                setLoading(false);
            }
        };

        fetchChatRoom();
    }, [roomId, salonId]);

    // 메시지 스크롤 처리
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleBackClick = () => {
        navigate('/chat');
    };

    const handleSendMessage = () => {
        if (!newMessage.trim() || !chatRoom) return;

        const tempMessage: ChatMessage = {
            id: Date.now(), // 임시 ID
            chatRoomId: chatRoom.id,
            senderType: 'USER',
            senderId: userId,
            message: newMessage,
            isRead: false,
            sentAt: new Date().toISOString(),
            translatedMessage: null,
            translationStatus: 'pending',
            photos: []
        };

        // 메시지를 즉시 UI에 추가
        setMessages(prev => [...prev, tempMessage]);

        // 웹소켓으로 메시지 전송
        WebSocketService.sendMessage(
            chatRoom.id,
            newMessage,
            'USER',
            [] // 사진 없음
        );

        setNewMessage('');
    };

    if (loading) {
        return (
            <div className={styles.loading}>
                <CircularProgress size={40} />
                <Typography sx={{ ml: 2 }}>채팅방을 불러오는 중...</Typography>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <IconButton onClick={handleBackClick} size="small">
                    <ArrowBackIcon />
                </IconButton>
                <Typography variant="h6">{chatRoom?.salonName || '채팅방'}</Typography>
            </div>

            <div className={styles.messagesContainer}>
                {messages.map((message) => {
                    const isUserMessage = message.senderType === 'USER';
                    const messageClassName = `${styles.messageBubble} ${isUserMessage ? styles.userMessage : styles.salonMessage}`;

                    return (
                        <div key={message.id} className={messageClassName}>
                            {!isUserMessage && (
                                <Avatar className={styles.messageAvatar} alt={chatRoom?.salonName} />
                            )}

                            <Paper elevation={0} className={styles.messageContent}>
                                <Typography className={styles.originalMessage}>
                                    {message.message}
                                </Typography>

                                {message.translatedMessage && (
                                    <Typography className={styles.translatedMessage}>
                                        {message.translatedMessage}
                                    </Typography>
                                )}

                                <Typography className={styles.messageTimestamp}>
                                    {new Date(message.sentAt).toLocaleTimeString([], {
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </Typography>
                            </Paper>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            <div className={styles.inputContainer}>
                <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="메시지를 입력하세요..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton size="small">
                                    <MicIcon />
                                </IconButton>
                                <IconButton
                                    size="small"
                                    onClick={handleSendMessage}
                                    disabled={!newMessage.trim()}
                                    color="primary"
                                >
                                    <SendIcon />
                                </IconButton>
                            </InputAdornment>
                        ),
                    }}
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            borderRadius: '24px',
                            backgroundColor: '#fff'
                        }
                    }}
                />
            </div>
        </div>
    );
};

export default ChatRoom;