import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    Typography,
    IconButton,
    Avatar,
    TextField,
    Paper,
    InputAdornment,
    CircularProgress,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SendIcon from '@mui/icons-material/Send';
import ImageIcon from '@mui/icons-material/Image';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Box from '@mui/material/Box';
import styles from './ChatRoom.module.css';
import ChatService, { ChatMessageDto, ChatPhoto } from '../../services/chat/ChatService';
import WebSocketService from '../../services/chat/WebSocketService';
import TranslationService from '../../services/chat/TranslationService';
import FileUploadService from '../../services/chat/FileUploadService';

interface ChatRoomInfo {
    id: number;
    salonId: string;
    salonName: string;
    userLanguage: string;
    salonLanguage: string;
}

interface TranslationState {
    isLoading: boolean;
    text: string | null;
    error: string | null;
}

const ChatRoom: React.FC = () => {
    const { roomId } = useParams<{ roomId: string }>();
    const [messages, setMessages] = useState<ChatMessageDto[]>([]);
    const [newMessage, setNewMessage] = useState<string>('');
    const [chatRoom, setChatRoom] = useState<ChatRoomInfo | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [translations, setTranslations] = useState<Record<number, TranslationState>>({});
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();
    const [userId, setUserId] = useState<string>('');
    const [errorModalOpen, setErrorModalOpen] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string>('');

    useEffect(() => {
        if (!roomId || !userId) return;

        const handleNewMessage = (messageData: ChatMessageDto) => {

            if (messageData.chatRoomId === Number(roomId)) {
                setMessages(prevMessages => {
                    const isDuplicate = prevMessages.some(msg =>
                        msg.id === messageData.id ||
                        (msg.message === messageData.message &&
                            msg.senderType === messageData.senderType &&
                            Math.abs(new Date(msg.sentAt).getTime() - new Date(messageData.sentAt).getTime()) < 5000)
                    );

                    if (isDuplicate) {
                        return prevMessages.map(msg =>
                            (msg.id === messageData.id ||
                                (msg.message === messageData.message &&
                                    msg.senderType === messageData.senderType &&
                                    Math.abs(new Date(msg.sentAt).getTime() - new Date(messageData.sentAt).getTime()) < 5000))
                                ? messageData : msg
                        );
                    } else {
                        const newMessages = [...prevMessages, messageData];
                        return newMessages;
                    }
                });

                if (messageData.senderType !== 'USER') {
                    ChatService.markMessagesAsRead(Number(roomId), 'USER')
                        .catch(err => console.error("메시지 읽음 처리 실패:", err));
                }
            } else {
            }
        };

        const handleChatRoomError = (error: any) => {
            console.error("채팅방 에러 발생:", error);

            // 삭제된 채팅방 에러 처리
            if (error?.code === 'CHAT_ROOM_DELETED' ||
                error?.message?.includes('deleted') ||
                error?.response?.data?.message?.includes('deleted')) {
                setErrorMessage('삭제된 채팅방입니다.');
                setErrorModalOpen(true);
            } else {
                // 기타 에러 처리
                setErrorMessage('채팅 메시지 전송 중 오류가 발생했습니다.');
                setErrorModalOpen(true);
            }
        };

        WebSocketService.addListener('message', handleNewMessage);
        WebSocketService.addListener('error', handleChatRoomError);

        return () => {
            WebSocketService.removeListener('message', handleNewMessage);
            WebSocketService.removeListener('error', handleChatRoomError);
        };
    }, [userId, roomId]);

    useEffect(() => {
        const fetchUserAndChatRoom = async () => {
            try {
                if (!roomId) return;

                const userResponse = await axios.get('/api/chat/user/current');
                const currentUserId = userResponse.data.id;
                setUserId(currentUserId);

                WebSocketService.initialize(currentUserId);

                const roomResponse = await axios.get(`/api/chat/room/${roomId}`);
                setChatRoom({
                    id: Number(roomId),
                    salonId: roomResponse.data.salonId,
                    salonName: roomResponse.data.salonName,
                    userLanguage: roomResponse.data.userLanguage,
                    salonLanguage: roomResponse.data.salonLanguage
                });

                const chatMessages = await ChatService.getChatMessages(Number(roomId));
                setMessages(chatMessages);

                await ChatService.markMessagesAsRead(Number(roomId), 'USER');

                setLoading(false);
            } catch (err) {
                navigate('/chat');
                setLoading(false);
            }
        };

        fetchUserAndChatRoom();
    }, [roomId]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleBackClick = () => {
        navigate('/chat');
    };

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

    const handleTranslateRequest = async (message: ChatMessageDto) => {
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

    const requestTranslation = async (message: ChatMessageDto) => {
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

    const handleSendMessage = async () => {
        if ((!newMessage.trim() && selectedFiles.length === 0) || !chatRoom || !userId) return;

        setLoading(true);

        try {
            let photoAttachments: ChatPhoto[] = [];

            if (selectedFiles.length > 0) {
                try {
                    const uploadResults = await FileUploadService.uploadMultipleImages(selectedFiles, chatRoom.id);

                    photoAttachments = uploadResults.map((result, index) => ({
                        photoId: Date.now() + index, // 고유 ID 생성
                        photoUrl: result.fileUrl
                    }));
                } catch (uploadError: any) {
                    console.error('사진 업로드 실패:', uploadError);
                    alert(`사진 업로드 실패: ${uploadError.message}`);
                    setLoading(false);
                    return;
                }
            }

            const tempMessage: ChatMessageDto = {
                id: Date.now(), // 임시 ID
                chatRoomId: chatRoom.id,
                senderType: 'USER',
                senderId: userId,
                message: newMessage.trim() ? newMessage : (selectedFiles.length > 0 ? '사진을 보냈습니다.' : ''),
                isRead: false,
                sentAt: new Date().toISOString(),
                translatedMessage: null,
                translationStatus: 'pending',
                photos: photoAttachments
            };

            setMessages(prev => [...prev, tempMessage]);

            setNewMessage('');
            setSelectedFiles([]);
            previewUrls.forEach(url => URL.revokeObjectURL(url));
            setPreviewUrls([]);

            const response = await WebSocketService.sendMessageWithPhotos(
                chatRoom.id,
                tempMessage.message,
                'USER',
                photoAttachments
            );

            console.log("메시지 전송 응답:", response);

            if (response && response.id && response.id !== tempMessage.id) {
                setMessages(prev =>
                    prev.map(msg =>
                        msg.id === tempMessage.id ? response : msg
                    )
                );
            }

        } catch (error) {
            console.error('메시지 전송 실패:', error);

            if (error?.response?.status === 404 ||
                error?.message?.includes('not found') ||
                error?.message?.includes('deleted')) {
                setErrorMessage('삭제된 채팅방입니다.');
                setErrorModalOpen(true);
            } else {
                // 기타 에러 처리
                setErrorMessage('메시지 전송에 실패했습니다. 다시 시도해주세요.');
                setErrorModalOpen(true);
            }
        } finally {
            setLoading(false);
        }
    };

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const openMenu = Boolean(anchorEl);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [deletedOpen, setDeletedOpen] = useState(false);

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleMenuClose = () => {
        setAnchorEl(null);
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
        } catch (error) {
            console.error('채팅방 삭제 실패:', error);
            alert('삭제에 실패했습니다.');
        }
    };

    const handleErrorModalClose = () => {
        setErrorModalOpen(false);
        // 채팅방 목록으로 리다이렉트
        navigate('/chat');
    };

    if (loading && messages.length === 0) {
        return (
            <div className={styles.loading}>
                <CircularProgress size={40} />
                <Typography sx={{ ml: 2 }}>채팅방을 불러오는 중...</Typography>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.header} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <IconButton onClick={handleBackClick} size="small">
                        <ArrowBackIcon />
                    </IconButton>
                    <Typography variant="h6" sx={{ ml: 2, fontWeight: 'bold' }}>
                        {chatRoom?.salonName || userName || '채팅방'}
                    </Typography>
                </Box>

                {/* 오른쪽 케밥 메뉴 */}
                <IconButton onClick={handleMenuOpen}>
                    <MoreVertIcon />
                </IconButton>
                <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
                    <MenuItem onClick={handleDeleteMenuClick}>채팅방 삭제</MenuItem>
                </Menu>
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

                                {/* 이미지가 있으면 표시 */}
                                {message.photos && message.photos.length > 0 && (
                                    <div className={styles.imageContainer}>
                                        {message.photos.map((photo, index) => (
                                            <img
                                                key={index}
                                                src={photo.photoUrl}
                                                alt={`Photo ${index}`}
                                                className={`${styles.messageImage} ${message.photos.length === 1 ? styles.singleImage : styles.multipleImages}`}
                                                onClick={() => window.open(photo.photoUrl, '_blank')}
                                            />
                                        ))}
                                    </div>
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
                {/* 선택된 이미지 미리보기를 입력 필드 위에 표시 */}
                {previewUrls.length > 0 && (
                    <div className={styles.previewContainer}>
                        {previewUrls.map((url, index) => (
                            <div key={index} className={styles.previewItem}>
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
                            </div>
                        ))}
                    </div>
                )}

                {/* 파일 선택을 위한 숨겨진 input */}
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
                                {/* 사진 업로드 버튼 */}
                                <IconButton size="small" onClick={handleFileSelect}>
                                    <ImageIcon />
                                </IconButton>
                                <IconButton
                                    size="small"
                                    onClick={handleSendMessage}
                                    disabled={!newMessage.trim() && selectedFiles.length === 0}
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
                            navigate('/chat');
                        }}
                        autoFocus
                    >
                        확인
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog
                open={errorModalOpen}
                onClose={handleErrorModalClose}
                aria-labelledby="error-dialog-title"
                aria-describedby="error-dialog-description"
            >
                <DialogTitle id="error-dialog-title">알림</DialogTitle>
                <DialogContent>
                    <DialogContentText id="error-dialog-description">
                        {errorMessage}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleErrorModalClose} color="primary" autoFocus>
                        확인
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default ChatRoom;