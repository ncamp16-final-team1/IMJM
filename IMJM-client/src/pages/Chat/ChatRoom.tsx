import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    // Box,
    Typography,
    IconButton,
    Avatar,
    TextField,
    Paper,
    InputAdornment
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SendIcon from '@mui/icons-material/Send';
import MicIcon from '@mui/icons-material/Mic';
import styles from './ChatRoom.module.css';

// 메시지 인터페이스
interface Message {
    id: number;
    senderId: string;
    senderType: 'USER' | 'SALON';
    content: string;
    translatedContent?: string;
    timestamp: string;
    isRead: boolean;
}

// 채팅방 정보 인터페이스
interface ChatRoomInfo {
    id: number;
    salonId: string;
    salonName: string;
    userLanguage: string;
    salonLanguage: string;
}

const ChatRoom: React.FC = () => {
    const { roomId, salonId } = useParams<{ roomId: string; salonId: string }>();
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState<string>('');
    const [chatRoom, setChatRoom] = useState<ChatRoomInfo | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    // 채팅방 정보와 메시지 로드
    useEffect(() => {
        const fetchChatRoom = async () => {
            try {
                // API 호출 대신 임시 데이터
                const mockChatRoom: ChatRoomInfo = {
                    id: parseInt(roomId || '0'),
                    salonId: salonId || '',
                    salonName: 'Salon A',
                    userLanguage: 'en', // 사용자 언어
                    salonLanguage: 'ko', // 미용실 언어
                };

                setChatRoom(mockChatRoom);

                // 메시지 로드 (임시 데이터)
                const mockMessages: Message[] = [
                    {
                        id: 1,
                        senderId: 'user1',
                        senderType: 'USER',
                        content: 'Hi! I want to get this hairstyle. How long will it take?',
                        translatedContent: '안녕하세요! 이 헤어스타일을 하고 싶은데요. 시간이 얼마나 걸릴까요?',
                        timestamp: '10:15',
                        isRead: true
                    },
                    {
                        id: 2,
                        senderId: 'salon1',
                        senderType: 'SALON',
                        content: '안녕하세요! 말씀하신 스타일이라면 약 2시간 정도 걸릴 것 같습니다.',
                        translatedContent: 'Hello! For the style you mentioned, it will take about 2 hours.',
                        timestamp: '10:23',
                        isRead: true
                    },
                    {
                        id: 3,
                        senderId: 'user1',
                        senderType: 'USER',
                        content: 'Oh, that\'s longer than I expected! Will this style damage my hair condition?',
                        translatedContent: '오, 생각보다 오래 걸리네요! 이 스타일이 제 모발 상태에 손상을 줄 수 있나요?',
                        timestamp: '10:30',
                        isRead: true
                    },
                    {
                        id: 4,
                        senderId: 'salon1',
                        senderType: 'SALON',
                        content: '네, 염색 작업이 포함되어 있어 약간의 손상은 있을 수 있습니다. 하지만 트리트먼트로 관리해 드립니다.',
                        translatedContent: 'Yes, since dyeing is involved, there might be some damage. But we\'ll take care of it with treatment.',
                        timestamp: '10:35',
                        isRead: false
                    }
                ];

                setMessages(mockMessages);
                setLoading(false);
            } catch (error) {
                console.error('채팅방 정보를 불러오는데 실패했습니다:', error);
                setLoading(false);
            }
        };

        if (roomId) {
            fetchChatRoom();
        }
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

        // 새로운 메시지 추가
        const newMessageObj: Message = {
            id: Date.now(),
            senderId: 'user1',
            senderType: 'USER',
            content: newMessage,
            translatedContent: '번역 중...', // 실제로는 백엔드에서 번역 진행
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isRead: false
        };

        setMessages([...messages, newMessageObj]);
        setNewMessage('');

        // 실제로는 여기서 API 호출하여 메시지 전송 및 번역 처리

        // 시뮬레이션: 미용실 응답 (2초 후)
        setTimeout(() => {
            // 번역 완료된 메시지로 업데이트
            setMessages(prev => {
                const updatedMessages = [...prev];
                const lastMessage = updatedMessages[updatedMessages.length - 1];

                if (lastMessage.id === newMessageObj.id) {
                    // 영어 -> 한국어로 번역된 메시지
                    if (lastMessage.content.toLowerCase().includes('hair')) {
                        lastMessage.translatedContent = '헤어스타일에 대해 더 알고 싶습니다. 염색 과정은 어떻게 진행되나요?';
                    } else if (lastMessage.content.toLowerCase().includes('price')) {
                        lastMessage.translatedContent = '가격이 얼마인가요?';
                    } else if (lastMessage.content.toLowerCase().includes('time')) {
                        lastMessage.translatedContent = '시간이 얼마나 걸릴까요?';
                    } else {
                        lastMessage.translatedContent = `${lastMessage.content} (번역됨)`;
                    }
                }

                return updatedMessages;
            });

            // 미용실 응답 추가
            const salonResponse: Message = {
                id: Date.now() + 1,
                senderId: 'salon1',
                senderType: 'SALON',
                content: '네, 저희 미용실에서는 모발 보호를 위해 특별한 케어 제품을 사용합니다. 걱정하지 않으셔도 됩니다.',
                translatedContent: 'Yes, our salon uses special care products to protect your hair. No need to worry.',
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                isRead: false
            };

            setMessages(prev => [...prev, salonResponse]);
        }, 2000);
    };

    if (loading || !chatRoom) {
        return <div className={styles.loading}>채팅방을 불러오는 중...</div>;
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <IconButton onClick={handleBackClick} size="small">
                    <ArrowBackIcon />
                </IconButton>
                <Typography variant="h6">{chatRoom.salonName}</Typography>
            </div>

            <div className={styles.messagesContainer}>
                {messages.map((message) => {
                    const isUserMessage = message.senderType === 'USER';
                    const messageClassName = `${styles.messageBubble} ${isUserMessage ? styles.userMessage : styles.salonMessage}`;

                    return (
                        <div key={message.id} className={messageClassName}>
                            {!isUserMessage && (
                                <Avatar className={styles.messageAvatar} alt={chatRoom.salonName} />
                            )}

                            <Paper elevation={0} className={styles.messageContent}>
                                <Typography className={styles.originalMessage}>
                                    {message.content}
                                </Typography>

                                {message.translatedContent && (
                                    <Typography className={styles.translatedMessage}>
                                        {message.translatedContent}
                                    </Typography>
                                )}

                                <Typography className={styles.messageTimestamp}>
                                    {message.timestamp}
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