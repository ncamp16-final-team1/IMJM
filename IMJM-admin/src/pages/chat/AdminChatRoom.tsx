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
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
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

const AdminChatRoom: React.FC<{ roomId: number; userId: string }> = ({ roomId, userId }) => {
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

    const handleTranslateRequest = async (message: ChatMessage) => {
        const messageId = message.id;

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

                const salonResponse = await axios.get('/api/admin/salons/my');
                const currentSalonId = salonResponse.data.id;
                setSalonId(currentSalonId);

                AdminWebSocketService.initialize(currentSalonId);

                try {
                    const roomResponse = await axios.get(`/api/chat/admin/room/${roomId}`);
                    if (roomResponse.data && roomResponse.data.userName) {
                        setUserName(roomResponse.data.userName);
                    }
                } catch (roomError) {
                    console.error('채팅방 정보를 불러오는데 실패했습니다:', roomError);
                }

                const chatMessages = await AdminChatService.getChatMessages(Number(roomId));
                setMessages(chatMessages);

                if (!userName && chatMessages.length > 0) {
                    const userMessage = chatMessages.find(msg => msg.senderType === 'USER');

                    if (userMessage) {
                        try {
                            const userResponse = await axios.get(`/api/user/info/${userMessage.senderId}`);
                            if (userResponse.data) {
                                setUserName(userResponse.data.nickname ||
                                    (userResponse.data.firstName + ' ' + userResponse.data.lastName));
                            } else {
                                setUserName(userMessage.senderId);
                            }
                        } catch (userError) {
                            console.error('사용자 정보를 불러오는데 실패했습니다:', userError);
                            setUserName(userMessage.senderId);
                        }
                    }
                }

                await AdminChatService.markMessagesAsRead(Number(roomId));

                setLoading(false);
            } catch (error) {
                navigate('/chat');
                setLoading(false);
            }
        };

        fetchSalonAndChatRoom();

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

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    // 파일 선택 핸들러
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

    const removeSelectedFile = (index: number) => {
        URL.revokeObjectURL(previewUrls[index]);
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
        setPreviewUrls(prev => prev.filter((_, i) => i !== index));
    };

    const handleSendMessage = async () => {
        if (sending || (!newMessage.trim() && selectedFiles.length === 0) || !salonId || !roomId) return;

        setSending(true);

        try {
            let photoAttachments: ChatPhoto[] = [];

            if (selectedFiles.length > 0) {
                try {
                    const uploadResults = await AdminFileUploadService.uploadMultipleImages(
                        selectedFiles,
                        Number(roomId)
                    );

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

            setMessages(prev => [...prev, tempMessage]);

            AdminWebSocketService.sendMessageWithPhotos(
                Number(roomId),
                newMessage.trim() ? newMessage : (selectedFiles.length > 0 ? '사진을 보냈습니다.' : ''),
                'SALON',
                photoAttachments
            );

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
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [deletedOpen, setDeletedOpen] = useState(false);

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

    const handleDeleteMenuClick = () => {
        setConfirmOpen(true);
    };

    const handleConfirmDelete = async () => {
        try {
            await axios.delete(`/api/chat/room/${roomId}`);
            setConfirmOpen(false);
            setDeletedOpen(true);

            window.location.reload();
        } catch (error) {
            console.error('채팅방 삭제 실패:', error);
            alert('삭제에 실패했습니다.');
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
                    <Typography variant="h6" sx={{ ml: 2, fontWeight: 'bold' }}>{userName}</Typography>
                </Box>
                <IconButton onClick={handleMenuOpen}>
                    <MoreVertIcon />
                </IconButton>
                <Menu anchorEl={menuAnchorEl} open={isMenuOpen} onClose={handleMenuClose}>
                    <MenuItem onClick={handleDeleteMenuClick}>채팅방 삭제</MenuItem>
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

            <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
                <DialogTitle>채팅방 삭제</DialogTitle>
                <DialogContent>
                    <Typography>
                        채팅방을 삭제하면 모든 메시지와 사진이 함께 삭제됩니다. 계속하시겠습니까?
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setConfirmOpen(false)}>취소</Button>
                    <Button onClick={handleConfirmDelete} color="error">삭제</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={deletedOpen} onClose={() => {
                setDeletedOpen(false);
                navigate('/chat');
            }}>
                <DialogTitle>삭제 완료</DialogTitle>
                <DialogContent>
                    <Typography>채팅방이 성공적으로 삭제되었습니다.</Typography>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => {
                            setDeletedOpen(false);
                            window.location.reload();
                        }}
                        autoFocus
                    >
                        확인
                    </Button>
                </DialogActions>
            </Dialog>
        </Paper>
    );
};

export default AdminChatRoom;