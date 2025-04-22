import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box,
    Typography,
    TextField,
    Paper,
    IconButton,
    Avatar,
    Button,
    InputAdornment,
    CircularProgress,
    Divider
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SendIcon from '@mui/icons-material/Send';
import ImageIcon from '@mui/icons-material/Image';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import styles from './ChatRoom.module.css';
import ChatService, { ChatMessage, ChatPhoto } from '../../service/chat/ChatService';
import WebSocketService from '../../service/chat/WebSocketService';
import FileUploadService from '../../service/chat/FileUploadService';
import TranslationService from '../../service/chat/TranslationService';

const ChatRoom: React.FC = () => {
    const { roomId, userId } = useParams<{ roomId: string; userId: string }>();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(true);
    const [translations, setTranslations] = useState<Record<number, { isLoading: boolean; text: string | null; error: string | null }>>({});
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);
    const [userName, setUserName] = useState<string>('');
    const [salonId, setSalonId] = useState<string>('');

    const fileInputRef = useRef<HTMLInputElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const initializeWebSocket = async () => {
            try {
                // 현재 로그인된 사용자 ID 가져오기
                const response = await fetch('/api/user/current');
                const userData = await response.json();

                if (userData && userData.id) {
                    WebSocketService.initialize(userData.id);
                }
            } catch (error) {
                console.error('사용자 정보를 가져오는데 실패했습니다:', error);
            }
        };

        initializeWebSocket();
    }, []);

    // 웹소켓 리스너 설정
    useEffect(() => {
        if (!salonId) return;

        const handleNewMessage = (messageData: ChatMessage) => {
            if (messageData.chatRoomId === Number(roomId)) {
                setMessages(prev => {
                    // 중복 메시지 확인
                    const messageExists = prev.some(msg =>
                        msg.message === messageData.message &&
                        msg.senderType === messageData.senderType &&
                        Math.abs(new Date(msg.sentAt).getTime() - new Date(messageData.sentAt).getTime()) < 5000
                    );

                    if (messageExists) {
                        return prev.map(msg =>
                            msg.message === messageData.message &&
                            msg.senderType === messageData.senderType &&
                            Math.abs(new Date(msg.sentAt).getTime() - new Date(messageData.sentAt).getTime()) < 5000
                                ? messageData : msg
                        );
                    } else {
                        return [...prev, messageData];
                    }
                });
            }
        };

        WebSocketService.addListener('message', handleNewMessage);

        return () => {
            WebSocketService.removeListener('message', handleNewMessage);
        };
    }, [roomId, salonId]);

    // 채팅 메시지 로드
    useEffect(() => {
        const fetchMessages = async () => {
            if (!roomId) return;

            try {
                setLoading(true);
                const messages = await ChatService.getChatMessages(Number(roomId));
                setMessages(messages);

                // 사용자 이름 찾기
                if (messages.length > 0) {
                    const userMessage = messages.find(msg => msg.senderType === 'USER');
                    if (userMessage) {
                        setUserName(userMessage.senderId); // 실제로는 API에서 사용자 이름을 가져와야 함
                    }
                }

                // 메시지 읽음 처리
                await ChatService.markMessagesAsRead(Number(roomId), 'SALON');

                setLoading(false);
            } catch (error) {
                console.error('메시지를 불러오는데 실패했습니다:', error);
                setLoading(false);
            }
        };

        fetchMessages();
    }, [roomId]);

    // 스크롤 자동 이동
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleBackClick = () => {
        navigate('/Chat');
    };

    // 파일 선택 처리
    const handleFileSelect = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        const newFiles: File[] = [];
        const newPreviewUrls: string[] = [];

        Array.from(files).forEach(file => {
            if (file.type.startsWith('image/')) {
                newFiles.push(file);
                newPreviewUrls.push(URL.createObjectURL(file));
            }
        });

        setSelectedFiles(prev => [...prev, ...newFiles]);
        setPreviewUrls(prev => [...prev, ...newPreviewUrls]);

        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    // 선택한 파일 제거
    const removeSelectedFile = (index: number) => {
        URL.revokeObjectURL(previewUrls[index]);
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
        setPreviewUrls(prev => prev.filter((_, i) => i !== index));
    };

    // 번역 요청
    const handleTranslateRequest = async (message: ChatMessage) => {
        const messageId = message.id;

        // 이미 번역이 로드되었으면 토글
        if (translations[messageId] && !translations[messageId].isLoading) {
            if (!translations[messageId].error && translations[messageId].text) {
                setTranslations(prev => {
                    const newTranslations = { ...prev };
                    delete newTranslations[messageId];
                    return newTranslations;
                });
                return;
            }

            if (translations[messageId].error) {
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

    // 번역 요청 실행
    const requestTranslation = async (message: ChatMessage) => {
        const messageId = message.id;
        const sourceLang = message.senderType === 'USER' ? 'en' : 'ko'; // 예시 (실제로는 사용자 언어 정보 필요)
        const targetLang = message.senderType === 'USER' ? 'ko' : 'en';

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

    // 메시지 전송
    const handleSendMessage = async () => {
        if ((!newMessage.trim() && selectedFiles.length === 0) || !salonId || !roomId) return;

        try {
            // 사진 업로드
            let photoAttachments: ChatPhoto[] = [];

            if (selectedFiles.length > 0) {
                const uploadResults = await FileUploadService.uploadMultipleImages(
                    selectedFiles,
                    Number(roomId)
                );

                photoAttachments = uploadResults.map((result, index) => ({
                    photoId: Date.now() + index,
                    photoUrl: result.fileUrl
                }));
            }

            // 메시지 전송
            WebSocketService.sendMessageWithPhotos(
                Number(roomId),
                newMessage.trim() ? newMessage : (selectedFiles.length > 0 ? '사진을 보냈습니다.' : ''),
                'SALON',
                photoAttachments
            );

            // 입력창 초기화
            setNewMessage('');
            setSelectedFiles([]);
            previewUrls.forEach(url => URL.revokeObjectURL(url));
            setPreviewUrls([]);

        } catch (error) {
            console.error('메시지 전송 실패:', error);
            alert('메시지 전송에 실패했습니다.');
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
                <CircularProgress />
                <Typography sx={{ ml: 2 }}>로딩 중...</Typography>
            </Box>
        );
    }

    return (
        <Paper elevation={3} className={styles.container}>
            {/* 헤더 */}
            <Box className={styles.header}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <IconButton onClick={handleBackClick} size="small">
                        <ArrowBackIcon />
                    </IconButton>
                    <Typography variant="h6" sx={{ ml: 2, fontWeight: 'bold' }}>{userName}</Typography>
                </Box>
            </Box>

            <Divider />

            {/* 메시지 영역 */}
            <Box className={styles.messagesContainer}>
                {messages.map((message) => {
                    const isSalonMessage = message.senderType === 'SALON';
                    const translationState = translations[message.id];

                    return (
                        <Box
                            key={message.id}
                            className={`${styles.messageWrapper} ${isSalonMessage ? styles.salonMessageWrapper : styles.userMessageWrapper}`}
                        >
                            {!isSalonMessage && (
                                <Avatar className={styles.avatar}>{userName.charAt(0)}</Avatar>
                            )}

                            <Box className={`${styles.messageBubble} ${isSalonMessage ? styles.salonMessage : styles.userMessage}`}>
                                <Typography className={styles.messageText}>
                                    {message.message}
                                </Typography>

                                {/* 이미지 표시 */}
                                {message.photos && message.photos.length > 0 && (
                                    <Box className={styles.imageContainer}>
                                        {message.photos.map((photo, index) => (
                                            <img
                                                key={index}
                                                src={photo.photoUrl}
                                                alt={`첨부 이미지 ${index + 1}`}
                                                className={`${styles.messageImage} ${message.photos.length === 1 ? styles.singleImage : styles.multipleImage}`}
                                                onClick={() => window.open(photo.photoUrl, '_blank')}
                                            />
                                        ))}
                                    </Box>
                                )}

                                {/* 번역 버튼 */}
                                <Button
                                    size="small"
                                    onClick={() => handleTranslateRequest(message)}
                                    className={styles.translateButton}
                                    disabled={translationState?.isLoading}
                                >
                                    {!translationState ? '번역' :
                                        translationState.isLoading ? '번역 중...' :
                                            translationState.error ? '다시 시도' : '번역 숨기기'}
                                </Button>

                                {/* 번역된 내용 표시 */}
                                {translationState && !translationState.isLoading && !translationState.error && (
                                    <Typography className={styles.translatedText}>
                                        {translationState.text}
                                    </Typography>
                                )}

                                {/* 번역 오류 표시 */}
                                {translationState?.error && (
                                    <Typography className={styles.translationError}>
                                        {translationState.error}
                                    </Typography>
                                )}

                                <Typography className={styles.messageTime}>
                                    {new Date(message.sentAt).toLocaleTimeString([], {
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </Typography>
                            </Box>

                            {isSalonMessage && (
                                <Avatar className={styles.avatar}>M</Avatar>
                            )}
                        </Box>
                    );
                })}
                <div ref={messagesEndRef} />
            </Box>

            {/* 이미지 미리보기 */}
            {previewUrls.length > 0 && (
                <Box className={styles.previewContainer}>
                    {previewUrls.map((url, index) => (
                        <Box key={index} className={styles.previewItem}>
                            <img
                                src={url}
                                alt={`Preview ${index}`}
                                className={styles.previewImage}
                            />
                            <IconButton
                                size="small"
                                className={styles.removeButton}
                                onClick={() => removeSelectedFile(index)}
                            >
                                ✕
                            </IconButton>
                        </Box>
                    ))}
                </Box>
            )}

            {/* 메시지 입력 영역 */}
            <Box className={styles.inputContainer}>
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    multiple
                    style={{ display: 'none' }}
                />

                <IconButton
                    onClick={handleFileSelect}
                    className={styles.attachButton}
                >
                    <AttachFileIcon />
                </IconButton>

                <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="메시지를 입력하세요..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton
                                    onClick={handleFileSelect}
                                    className={styles.imageButton}
                                >
                                    <ImageIcon />
                                </IconButton>
                                <IconButton
                                    onClick={handleSendMessage}
                                    disabled={!newMessage.trim() && selectedFiles.length === 0}
                                    color="primary"
                                    className={styles.sendButton}
                                >
                                    <SendIcon />
                                </IconButton>
                            </InputAdornment>
                        ),
                    }}
                    multiline
                    maxRows={4}
                    className={styles.messageInput}
                />
            </Box>
        </Paper>
    );
};

export default ChatRoom;