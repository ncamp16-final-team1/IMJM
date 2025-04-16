import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Typography,
    IconButton,
    Avatar,
    TextField,
    Paper,
    InputAdornment,
    CircularProgress,
    Button
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SendIcon from '@mui/icons-material/Send';
import MicIcon from '@mui/icons-material/Mic';
import styles from './ChatRoom.module.css';
import ChatService, { ChatMessage } from '../../services/chat/ChatService';
import WebSocketService from '../../services/chat/WebSocketService';
import TranslationService from '../../services/chat/TranslationService';

interface ChatRoomInfo {
    id: number;
    salonId: string;
    salonName: string;
    userLanguage: string;
    salonLanguage: string;
}

// 번역 상태를 관리하기 위한 인터페이스
interface TranslationState {
    isLoading: boolean;
    text: string | null;
    error: string | null;
}

const ChatRoom: React.FC = () => {
    const { roomId, salonId } = useParams<{ roomId: string; salonId: string }>();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState<string>('');
    const [chatRoom, setChatRoom] = useState<ChatRoomInfo | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    // 번역 상태를 관리하는 상태 변수 (messageId를 키로 사용)
    const [translations, setTranslations] = useState<Record<number, TranslationState>>({});
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
                        msg.translationStatus === messageData.translationStatus &&
                        msg.translatedMessage === messageData.translatedMessage &&
                        Math.abs(new Date(msg.sentAt).getTime() - new Date(messageData.sentAt).getTime()) < 5000
                    );

                    if (messageExists) {
                        // 기존 메시지를 새 메시지로 업데이트
                        return prev.map(msg =>
                            msg.message === messageData.message &&
                            msg.senderType === messageData.senderType &&
                            msg.translationStatus === messageData.translationStatus &&
                            msg.translatedMessage === messageData.translatedMessage &&
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

    // 번역 요청 및 토글 함수
    const handleTranslateRequest = async (message: ChatMessage) => {
        const messageId = message.id;

        // 이미 번역이 로드되었으면 토글 수행
        if (translations[messageId] && !translations[messageId].isLoading) {
            // 이미 번역이 표시되어 있으면 제거
            if (!translations[messageId].error && translations[messageId].text) {
                setTranslations(prev => {
                    const newTranslations = { ...prev };
                    delete newTranslations[messageId];
                    return newTranslations;
                });
                return;
            }

            // 에러가 있으면 다시 시도
            if (translations[messageId].error) {
                // 로딩 상태로 설정
                setTranslations(prev => ({
                    ...prev,
                    [messageId]: { isLoading: true, text: null, error: null }
                }));

                try {
                    await requestTranslation(message);
                } catch (error) {
                    console.error('번역 요청 실패:', error);
                }
            }
            return;
        }

        // 로딩 상태로 설정
        setTranslations(prev => ({
            ...prev,
            [messageId]: { isLoading: true, text: null, error: null }
        }));

        try {
            await requestTranslation(message);
        } catch (error) {
            console.error('번역 요청 실패:', error);
            setTranslations(prev => ({
                ...prev,
                [messageId]: { isLoading: false, text: null, error: '번역 요청에 실패했습니다.' }
            }));
        }
    };

    // 실제 번역 요청을 수행하는 함수
    const requestTranslation = async (message: ChatMessage) => {
        if (!chatRoom) return;

        const messageId = message.id;
        const sourceLang = message.senderType === 'USER' ? chatRoom.userLanguage : chatRoom.salonLanguage;
        const targetLang = message.senderType === 'USER' ? chatRoom.salonLanguage : chatRoom.userLanguage;

        try {
            const translatedText = await TranslationService.translate(
                message.message,
                sourceLang,
                targetLang
            );

            setTranslations(prev => ({
                ...prev,
                [messageId]: { isLoading: false, text: translatedText, error: null }
            }));
        } catch (error) {
            console.error('번역 요청 실패:', error);
            setTranslations(prev => ({
                ...prev,
                [messageId]: { isLoading: false, text: null, error: '번역 요청에 실패했습니다.' }
            }));
        }
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
                    const translationState = translations[message.id];

                    return (
                        <div key={message.id} className={messageClassName}>
                            {!isUserMessage && (
                                <Avatar className={styles.messageAvatar} alt={chatRoom?.salonName} />
                            )}

                            <Paper elevation={0} className={styles.messageContent}>
                                <Typography className={styles.originalMessage}>
                                    {message.message}
                                </Typography>

                                <Button
                                    size="small"
                                    onClick={() => handleTranslateRequest(message)}
                                    className={styles.translateButton}
                                    disabled={translationState?.isLoading}
                                >
                                    {!translationState ? '번역 보기' :
                                        translationState.isLoading ? '번역 중...' :
                                            translationState.error ? '다시 시도' : '번역 숨기기'}
                                </Button>

                                {translationState && !translationState.isLoading && !translationState.error && (
                                    <Typography className={styles.translatedMessage}>
                                        {translationState.text}
                                    </Typography>
                                )}

                                {translationState?.error && (
                                    <Typography className={styles.translationError}>
                                        {translationState.error}
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