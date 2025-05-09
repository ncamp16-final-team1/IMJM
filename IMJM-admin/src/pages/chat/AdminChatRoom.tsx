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
    isServerTranslation?: boolean;
    isLocalTranslation?: boolean;
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

    // 삭제된 채팅방 처리를 위한 상태 추가
    const [chatRoomDeletedModalOpen, setChatRoomDeletedModalOpen] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string>('');

    const fileInputRef = useRef<HTMLInputElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    const [userProfileUrl, setUserProfileUrl] = useState<string | null>(null);
    const [salonProfileUrl, setSalonProfileUrl] = useState<string | null>(null);

    const [isDeleting, setIsDeleting] = useState<boolean>(false);

    // 번역 요청 처리 함수
    const handleTranslateRequest = async (message: ChatMessage) => {
        const messageId = message.id;

        // 메시지 세부 정보 로깅
        console.log("번역 요청 메시지 세부 정보:", {
            id: message.id,
            content: message.message,
            translatedMessage: message.translatedMessage,
            translationStatus: message.translationStatus,
            hasTranslatedMessage: !!message.translatedMessage,
            hasStatus: !!message.translationStatus
        });

        // 이미 번역 상태가 있는 경우
        if (translations[messageId]) {
            // 번역 로딩 중이 아니고
            if (!translations[messageId].isLoading) {
                // 에러가 없고 번역 텍스트가 있으면 (번역이 완료된 상태)
                if (!translations[messageId].error && translations[messageId].text) {
                    // 번역을 숨김 (번역 상태 제거)
                    setTranslations(prev => {
                        const newTranslations = { ...prev };
                        delete newTranslations[messageId];
                        return newTranslations;
                    });
                    return;
                }

                // 에러가 있으면 다시 번역 시도
                if (translations[messageId].error) {
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
                }
                return;
            }
            // 로딩 중이면 아무것도 하지 않음
            return;
        }

        // 번역 상태가 없는 경우 (첫 번역 요청)
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
        console.log(`메시지 ${messageId} 번역 시작:`, message.message);

        if (message.translatedMessage && message.translationStatus === "completed") {
            console.log(`메시지 ${messageId} 서버 번역 사용:`, message.translatedMessage);

            await new Promise<void>(resolve => {
                setTranslations(prev => {
                    const result = {
                        ...prev,
                        [messageId]: {
                            isLoading: false,
                            text: message.translatedMessage,
                            error: null,
                            isServerTranslation: true
                        }
                    };
                    resolve(); // 상태 업데이트 완료 신호
                    return result;
                });
            });

            return;
        }

        const sourceLang = message.senderType === 'USER' ? userLanguage : salonLanguage;
        const targetLang = message.senderType === 'USER' ? salonLanguage : userLanguage;

        console.log("번역 요청 언어:", { sourceLang, targetLang });

        if (!message.message || message.message.trim() === '') {
            setTranslations(prev => ({
                ...prev,
                [messageId]: { isLoading: false, text: "", error: null }
            }));
            return;
        }

        try {
            const translatedText = await TranslationService.translate(
                message.message,
                sourceLang,
                targetLang
            );

            if (translatedText) {
                setTranslations(prev => ({
                    ...prev,
                    [messageId]: {
                        isLoading: false,
                        text: translatedText,
                        error: null
                    }
                }));
            } else {
                throw new Error("번역 결과가 없습니다");
            }
        } catch (error) {
            console.error('번역 처리 실패:', error);
            setTranslations(prev => ({
                ...prev,
                [messageId]: {
                    isLoading: false,
                    text: null,
                    error: '번역에 실패했습니다. 나중에 다시 시도해주세요.'
                }
            }));
        }
    };

    // 삭제된 채팅방 모달을 닫고 채팅 목록으로 이동하는 함수
    const handleChatRoomDeletedModalClose = () => {
        setChatRoomDeletedModalOpen(false);
        window.location.reload();
    };

    useEffect(() => {
        const fetchSalonAndChatRoom = async () => {
            try {
                if (!roomId) return;

                // 언어 코드 초기화 (기본값 설정)
                if (!userLanguage) {
                    setUserLanguage('en');
                }

                if (!salonLanguage) {
                    setSalonLanguage('ko');
                }

                const salonResponse = await axios.get('/api/admin/salons/my');
                const currentSalonId = salonResponse.data.id;
                setSalonId(currentSalonId);

                AdminWebSocketService.initialize(currentSalonId);

                try {
                    await axios.get(`/api/chat/room/check/${roomId}`);
                } catch (checkError: any) {
                    console.error('채팅방 존재 확인 실패:', checkError);
                    if (checkError.response && checkError.response.status === 404) {
                        setErrorMessage('존재하지 않는 채팅방이거나 이미 삭제된 채팅방입니다.');
                        setChatRoomDeletedModalOpen(true);
                        setLoading(false);
                        return;
                    }
                }

                try {
                    const roomResponse = await axios.get(`/api/admin/chat/room/${roomId}`);
                    if (roomResponse.data && roomResponse.data.userName) {
                        setUserName(roomResponse.data.userName);
                    }

                    if (roomResponse.data.userLanguage) {
                        setUserLanguage(roomResponse.data.userLanguage);
                    }

                    if (roomResponse.data.salonLanguage) {
                        setSalonLanguage(roomResponse.data.salonLanguage);
                    }

                    setUserProfileUrl(roomResponse.data.userProfileUrl);
                    setSalonProfileUrl(roomResponse.data.salonProfileUrl);
                } catch (roomError: any) {
                    console.error('채팅방 정보를 불러오는데 실패했습니다:', roomError);

                    if (roomError.response && roomError.response.status === 404) {
                        setErrorMessage('존재하지 않는 채팅방입니다.');
                        setChatRoomDeletedModalOpen(true);
                        setLoading(false);
                        return;
                    }
                }

                try {
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

                    AdminWebSocketService.emitMessageRead(Number(roomId));
                } catch (messageError: any) {
                    console.error('채팅 메시지를 불러오는데 실패했습니다:', messageError);

                    if (messageError.response && messageError.response.status === 404) {
                        setErrorMessage('존재하지 않는 채팅방이거나 이미 삭제된 채팅방입니다.');
                        setChatRoomDeletedModalOpen(true);
                        setLoading(false);
                        return;
                    }

                    if (messageError.message && (
                        messageError.message.includes('존재하지 않') ||
                        messageError.message.includes('not found') ||
                        messageError.message.includes('404')
                    )) {
                        setErrorMessage('존재하지 않는 채팅방이거나 이미 삭제된 채팅방입니다.');
                        setChatRoomDeletedModalOpen(true);
                        setLoading(false);
                        return;
                    }
                }

                setLoading(false);
            } catch (error: any) {
                console.error('채팅방 로딩 중 오류 발생:', error);
                if (error.response && error.response.status === 404) {
                    setErrorMessage('존재하지 않는 채팅방이거나 이미 삭제된 채팅방입니다.');
                } else {
                    setErrorMessage('채팅방을 불러오는 중 오류가 발생했습니다.');
                }
                setChatRoomDeletedModalOpen(true);
                setLoading(false);
            }
        };

        fetchSalonAndChatRoom();

        const handleNewMessage = (messageData: ChatMessage) => {
            if (messageData.chatRoomId === Number(roomId)) {
                setMessages(prev => {
                    const exactIdMatch = prev.some(msg => msg.id === messageData.id);
                    if (exactIdMatch) {
                        return prev;
                    }

                    if (messageData.senderType === 'SALON' && messageData.senderId === salonId) {
                        const similarMessage = prev.find(msg =>
                            msg.senderType === 'SALON' &&
                            msg.senderId === salonId &&
                            msg.message === messageData.message &&
                            msg.id > 1000000000
                        );

                        if (similarMessage) {
                            return prev.map(msg =>
                                msg === similarMessage ? messageData : msg
                            );
                        }
                    }

                    return [...prev, messageData];
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

    }, [roomId, userId, userName, navigate]);

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

            // 임시 ID 생성 (클라이언트에서 생성한 ID는 큰 숫자로 설정)
            const tempId = Date.now();

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

            setNewMessage('');
            setSelectedFiles([]);
            previewUrls.forEach(url => URL.revokeObjectURL(url));
            setPreviewUrls([]);

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

        } catch (error: any) {
            console.error('메시지 전송 실패:', error);

            if (error.response && error.response.status === 404) {
                setErrorMessage('메시지를 전송할 수 없습니다. 채팅방이 이미 삭제되었을 수 있습니다.');
                setChatRoomDeletedModalOpen(true);
            } else {
                alert('메시지 전송에 실패했습니다. 다시 시도해주세요.');
            }
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
            await axios.delete(`/api/admin/chat/room/${roomId}`);
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
            setIsDeleting(true);
            await axios.delete(`/api/chat/room/${roomId}`);
            setConfirmOpen(false);
            setDeletedOpen(true);
        } catch (error) {
            console.error('채팅방 삭제 실패:', error);
            setIsDeleting(false);
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
            <Dialog
                open={chatRoomDeletedModalOpen}
                onClose={handleChatRoomDeletedModalClose}
                aria-labelledby="deleted-chatroom-dialog-title"
                aria-describedby="deleted-chatroom-dialog-description"
            >
                <DialogTitle id="deleted-chatroom-dialog-title">알림</DialogTitle>
                <DialogContent>
                    <Typography id="deleted-chatroom-dialog-description">
                        {errorMessage}
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleChatRoomDeletedModalClose} color="primary" autoFocus>
                        확인
                    </Button>
                </DialogActions>
            </Dialog>

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
                                <Avatar
                                    className={styles.avatar}
                                    src={userProfileUrl || undefined}
                                    alt={userName}
                                >
                                    {!userProfileUrl && userName ? userName.charAt(0) : 'U'}
                                </Avatar>
                            )}

                            <Box className={`${styles.messageBubble} ${isSalonMessage ? styles.salonMessage : styles.userMessage}`}>
                                <Typography className={styles.messageText}>
                                    {message.message}
                                </Typography>

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

                                {message.translatedMessage && (
                                    <Button
                                        size="small"
                                        onClick={() => {
                                            setTranslations(prev => {
                                                if (!prev[message.id]) {
                                                    return {
                                                        ...prev,
                                                        [message.id]: {
                                                            isLoading: false,
                                                            text: message.translatedMessage,
                                                            error: null,
                                                            isServerTranslation: true // 서버 번역임을 표시
                                                        }
                                                    };
                                                }
                                                else {
                                                    const newTranslations = { ...prev };
                                                    delete newTranslations[message.id];
                                                    return newTranslations;
                                                }
                                            });
                                        }}
                                        className={styles.translateButton}
                                    >
                                        {!translations[message.id] ? '번역 보기' : '번역 숨기기'}
                                    </Button>
                                )}

                                {!message.translatedMessage && (
                                    <Button
                                        size="small"
                                        onClick={() => handleTranslateRequest(message)}
                                        className={styles.translateButton}
                                        disabled={translations[message.id]?.isLoading}
                                    >
                                        {translations[message.id] === undefined ? '번역 보기' :
                                            translations[message.id]?.isLoading ? '번역 중...' :
                                                translations[message.id]?.error ? '다시 시도' : '번역 숨기기'}
                                    </Button>
                                )}

                                {translations[message.id] && !translations[message.id].isLoading && !translations[message.id].error && (
                                    <Typography className={styles.translatedMessage}>
                                        {translations[message.id].text}
                                    </Typography>
                                )}

                                {translations[message.id]?.error && (
                                    <Typography className={styles.translationError}>
                                        {translations[message.id].error}
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
                                <Avatar
                                    className={styles.avatar}
                                    src={salonProfileUrl || undefined}
                                    alt="Salon"
                                >
                                    {!salonProfileUrl ? 'S' : ''}
                                </Avatar>
                            )}
                        </Box>
                    );
                })}
                <div ref={messagesEndRef} />
            </Box>

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
                window.location.href = "/chat";
            }}>
                <DialogTitle>삭제 완료</DialogTitle>
                <DialogContent>
                    <Typography>채팅방이 성공적으로 삭제되었습니다.</Typography>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => {
                            setDeletedOpen(false);
                            window.location.href = "/chat";
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