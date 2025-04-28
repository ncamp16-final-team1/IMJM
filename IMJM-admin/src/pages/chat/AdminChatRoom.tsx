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
import AdminChatService, { ChatMessage, ChatPhoto } from '../../service/chat/AdminChatService';
import AdminWebSocketService from '../../service/chat/AdminWebSocketService';
import AdminFileUploadService from '../../service/chat/AdminFileUploadService';
import styles from './ChatRoom.module.css';
import axios from 'axios';

// 번역 상태를 관리하기 위한 인터페이스
interface TranslationState {
    isLoading: boolean;
    text: string | null;
    error: string | null;
}

const AdminChatRoom: React.FC = () => {
    const { roomId, userId } = useParams<{ roomId: string; userId: string }>();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(true);
    const [translations, setTranslations] = useState<Record<number, TranslationState>>({});
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);
    const [userName, setUserName] = useState<string>('');
    const [salonId, setSalonId] = useState<string>('');
    const [sending, setSending] = useState<boolean>(false);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchSalonAndChatRoom = async () => {
            try {
                if (!roomId) return;

                // 현재 로그인된 미용실 정보 가져오기
                const salonResponse = await axios.get('/api/admin/salons/my');
                const currentSalonId = salonResponse.data.id;
                setSalonId(currentSalonId);

                // WebSocket 연결 초기화
                AdminWebSocketService.initialize(currentSalonId);

                // 채팅 메시지 로드
                const chatMessages = await AdminChatService.getChatMessages(Number(roomId));
                setMessages(chatMessages);

                // 사용자 이름 설정
                if (chatMessages.length > 0) {
                    const userMessage = chatMessages.find(msg => msg.senderType === 'USER');
                    if (userMessage) {
                        setUserName(userMessage.senderId);
                    }
                }

                // 메시지 읽음 처리
                await AdminChatService.markMessagesAsRead(Number(roomId));

                setLoading(false);
            } catch (error) {
                console.error('채팅방 정보를 불러오는데 실패했습니다:', error);
                setLoading(false);
            }
        };

        fetchSalonAndChatRoom();

        // 메시지 수신 리스너 설정
        const handleNewMessage = (messageData: ChatMessage) => {
            if (messageData.chatRoomId === Number(roomId)) {
                setMessages(prev => {
                    // 중복 메시지 확인
                    const messageExists = prev.some(msg =>
                        msg.id === messageData.id ||
                        (msg.message === messageData.message &&
                            msg.senderType === messageData.senderType &&
                            Math.abs(new Date(msg.sentAt).getTime() - new Date(messageData.sentAt).getTime()) < 5000)
                    );

                    if (messageExists) {
                        return prev.map(msg =>
                            (msg.id === messageData.id ||
                                (msg.message === messageData.message &&
                                    msg.senderType === messageData.senderType &&
                                    Math.abs(new Date(msg.sentAt).getTime() - new Date(messageData.sentAt).getTime()) < 5000))
                                ? messageData : msg
                        );
                    } else {
                        return [...prev, messageData];
                    }
                });

                // 메시지 읽음 처리 - 본인이 보낸 메시지가 아닌 경우만
                if (messageData.senderType !== 'SALON') {
                    AdminChatService.markMessagesAsRead(Number(roomId))
                        .catch(err => console.error("메시지 읽음 처리 실패:", err));
                }
            }
        };

        if (salonId) {
            AdminWebSocketService.addListener('message', handleNewMessage);
        }

        return () => {
            if (salonId) {
                AdminWebSocketService.removeListener('message', handleNewMessage);
            }
        };

    }, [roomId, userId, salonId]);

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

    // 파일 선택 핸들러
    const handleFileSelect = () => {
        fileInputRef.current?.click();
    };

    // 파일 변경 핸들러
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

    // 메시지 전송
    const handleSendMessage = async () => {
        if (sending || (!newMessage.trim() && selectedFiles.length === 0) || !salonId || !roomId) return;

        setSending(true);

        try {
            // 사진이 있는 경우 먼저 업로드
            let photoAttachments: ChatPhoto[] = [];

            if (selectedFiles.length > 0) {
                try {
                    // 여러 이미지를 개별적으로 업로드
                    const uploadResults = await AdminFileUploadService.uploadMultipleImages(
                        selectedFiles,
                        Number(roomId)
                    );

                    // 업로드 결과를 ChatPhoto 형식으로 변환
                    photoAttachments = uploadResults.map((result, index) => ({
                        photoId: Date.now() + index,
                        photoUrl: result.fileUrl
                    }));
                } catch (uploadError: any) {
                    console.error('사진 업로드 실패:', uploadError);
                    alert(`사진 업로드 실패: ${uploadError.message}`);
                    setSending(false);
                    return;
                }
            }

            // 임시 메시지 객체 생성 (UI에 즉시 표시용)
            const tempMessage: ChatMessage = {
                id: Date.now(), // 임시 ID
                chatRoomId: Number(roomId),
                senderType: 'SALON',
                senderId: salonId,
                message: newMessage.trim() ? newMessage : (selectedFiles.length > 0 ? '사진을 보냈습니다.' : ''),
                isRead: false,
                sentAt: new Date().toISOString(),
                translatedMessage: null,
                translationStatus: 'pending',
                photos: photoAttachments
            };

            // 메시지를 즉시 UI에 추가
            setMessages(prev => [...prev, tempMessage]);

            // WebSocket을 통해 메시지 전송
            AdminWebSocketService.sendMessageWithPhotos(
                Number(roomId),
                newMessage.trim() ? newMessage : (selectedFiles.length > 0 ? '사진을 보냈습니다.' : ''),
                'SALON',
                photoAttachments
            );

            // 입력 필드 및 선택된 파일 초기화
            setNewMessage('');
            setSelectedFiles([]);
            previewUrls.forEach(url => URL.revokeObjectURL(url));
            setPreviewUrls([]);

        } catch (error) {
            console.error('메시지 전송 실패:', error);
            alert('메시지 전송에 실패했습니다. 다시 시도해주세요.');
        } finally {
            setSending(false);
        }
    };

    if (loading && messages.length === 0) {
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
                    const messageClassName = `${styles.messageWrapper} ${isSalonMessage ? styles.salonMessageWrapper : styles.userMessageWrapper}`;

                    return (
                        <Box
                            key={message.id}
                            className={messageClassName}
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

                <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="메시지를 입력하세요..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault(); // 기본 동작 방지
                            handleSendMessage();
                        }
                    }}
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
                                    disabled={!newMessage.trim() && selectedFiles.length === 0 || sending}
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

export default AdminChatRoom;