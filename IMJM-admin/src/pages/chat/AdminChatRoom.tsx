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
import MoreVertIcon from '@mui/icons-material/MoreVert';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import AdminChatService, { ChatMessage, ChatPhoto } from '../../service/chat/AdminChatService';
import AdminWebSocketService from '../../service/chat/AdminWebSocketService';
import AdminFileUploadService from '../../service/chat/AdminFileUploadService';
import TranslationService from '../../service/chat/TranslationService';
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
    const [userLanguage, setUserLanguage] = useState<string>('en');
    const [salonLanguage, setSalonLanguage] = useState<string>('ko');

    const fileInputRef = useRef<HTMLInputElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

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
        const messageId = message.id;
        const sourceLang = message.senderType === 'USER' ? userLanguage : salonLanguage;
        const targetLang = message.senderType === 'USER' ? salonLanguage : userLanguage;

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

    useEffect(() => {
        const fetchSalonAndChatRoom = async () => {
            try {
                if (!roomId) return;

                // 현재 로그인된 미용실 정보 가져오기
                const salonResponse = await axios.get('/api/admin/salons/my');
                const currentSalonId = salonResponse.data.id;
                setSalonId(currentSalonId);

                // WebSocket 초기화
                AdminWebSocketService.initialize(currentSalonId);

                // 채팅방 정보 가져오기 - 새 API 사용
                try {
                    const roomResponse = await axios.get(`/api/chat/admin/room/${roomId}`);
                    if (roomResponse.data && roomResponse.data.userName) {
                        setUserName(roomResponse.data.userName);
                    }
                } catch (roomError) {
                    console.error('채팅방 정보를 불러오는데 실패했습니다:', roomError);
                    // 오류 발생 시 대체 방법으로 진행 (아래 메시지 로딩 시 처리)
                }

                // 채팅 메시지 로드
                const chatMessages = await AdminChatService.getChatMessages(Number(roomId));
                setMessages(chatMessages);

                // 사용자 이름이 아직 설정되지 않은 경우 메시지에서 추출
                if (!userName && chatMessages.length > 0) {
                    // 사용자가 보낸 메시지 찾기
                    const userMessage = chatMessages.find(msg => msg.senderType === 'USER');

                    if (userMessage) {
                        try {
                            // 사용자 정보 요청 - 이 API는 사용자 정보를 제공하는 엔드포인트가 있다고 가정
                            const userResponse = await axios.get(`/api/user/info/${userMessage.senderId}`);
                            if (userResponse.data) {
                                // 닉네임 또는 이름 사용
                                setUserName(userResponse.data.nickname ||
                                    (userResponse.data.firstName + ' ' + userResponse.data.lastName));
                            } else {
                                // 대체: 사용자 ID 사용
                                setUserName(userMessage.senderId);
                            }
                        } catch (userError) {
                            console.error('사용자 정보를 불러오는데 실패했습니다:', userError);
                            // 대체: 사용자 ID 사용
                            setUserName(userMessage.senderId);
                        }
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

    }, [roomId, userId, userName]);

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

    const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
    const isMenuOpen = Boolean(menuAnchorEl);

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        setMenuAnchorEl(event.currentTarget);
    };
    const handleMenuClose = () => {
        setMenuAnchorEl(null);
    };
    const handleDeleteRoom = async () => {
        try {
            await axios.delete(`/api/chat/room/${roomId}`);
            navigate('/chat');
        } catch (error) {
            console.error('채팅방 삭제 실패:', error);
            alert('채팅방 삭제에 실패했습니다.');
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
            <Box className={styles.header} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <IconButton onClick={handleBackClick} size="small">
                        <ArrowBackIcon />
                    </IconButton>
                    <Typography variant="h6" sx={{ ml: 2, fontWeight: 'bold' }}>{userName}</Typography>
                </Box>
                <IconButton onClick={handleMenuOpen}>
                    <MoreVertIcon />
                </IconButton>
                <Menu anchorEl={menuAnchorEl} open={isMenuOpen} onClose={handleMenuClose}>
                    <MenuItem onClick={handleDeleteRoom}>채팅방 삭제</MenuItem>
                </Menu>
            </Box>

            <Divider />

            {/* 메시지 영역 */}
            <Box className={styles.messagesContainer}>
                {messages.map((message) => {
                    const isSalonMessage = message.senderType === 'SALON';
                    const messageClassName = `${styles.messageWrapper} ${isSalonMessage ? styles.salonMessageWrapper : styles.userMessageWrapper}`;
                    const translationState = translations[message.id];

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