import React, { useEffect, useState } from 'react';
import {
    List,
    ListItem,
    ListItemText,
    Typography,
    Box,
    Divider,
    CircularProgress,
    Button
} from '@mui/material';
import MarkChatReadIcon from '@mui/icons-material/MarkChatRead';
import ChatIcon from '@mui/icons-material/Chat';
import EventIcon from '@mui/icons-material/Event';
import RateReviewIcon from '@mui/icons-material/RateReview';
import InfoIcon from '@mui/icons-material/Info';
import NotificationService, { AlarmDto } from '../../services/notification/NotificationService';
import { useNavigate } from 'react-router-dom';

interface NotificationListProps {
    onNotificationRead?: () => void;
    onClose?: () => void; // 모달 닫기 함수 추가
}

const NotificationList: React.FC<NotificationListProps> = ({ onNotificationRead, onClose }) => {
    const [notifications, setNotifications] = useState<AlarmDto[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                setLoading(true);
                const data = await NotificationService.getNotifications();
                console.log('서버에서 받은 알림 데이터:', data); // 로그 추가
                setNotifications(data);
            } catch (error) {
                console.error('알림 목록 로드 실패:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchNotifications();

        // 페이지 포커스될 때마다 갱신
        const handleFocus = () => {
            fetchNotifications();
        };
        window.addEventListener('focus', handleFocus);

        // 새 알림을 수신했을 때 목록에 추가
        const handleNewNotification = (notification: AlarmDto) => {
            setNotifications(prev => [notification, ...prev]);
        };

        // 알림 리스너 등록
        NotificationService.addListener(handleNewNotification);

        // 컴포넌트 언마운트 시 리스너 제거
        return () => {
            NotificationService.removeListener(handleNewNotification);
            window.removeEventListener('focus', handleFocus);
        };
    }, []);

    const handleNotificationClick = async (notification: AlarmDto) => {
        try {
            // 읽음 처리
            await NotificationService.markAsRead(notification.id);

            // UI 상태 즉시 업데이트 - isRead 속성을 true로 변경
            setNotifications(prevNotifications =>
                prevNotifications.map(n =>
                    n.id === notification.id ? { ...n, read: true } : n
                )
            );

            // 상위 컴포넌트에 알림 읽음 처리 이벤트 전달 (카운트 업데이트 등을 위해)
            if (onNotificationRead) {
                onNotificationRead();
            }

            // 모달 닫기
            if (onClose) {
                onClose();
            }

            // 알림 타입에 따라 다른 페이지로 이동
            if (notification.notificationType === 'CHAT' && notification.referenceId) {
                navigate(`/chat/${notification.referenceId}`);
            } else if (notification.notificationType === 'RESERVATION') {
                navigate('/myPage/appointments');
            } else if (notification.notificationType === 'REVIEW') {
                navigate('/myPage'); // 또는 리뷰 관련 페이지
            }
        } catch (error) {
            console.error('알림 처리 실패:', error);
        }
    };

    const handleMarkAllAsRead = async () => {
        if (notifications.length === 0) return;

        try {
            await NotificationService.markAllAsRead();

            // 모든 알림을 읽음 처리된 것으로 UI 상태 업데이트
            setNotifications(prevNotifications =>
                prevNotifications.map(notification => ({ ...notification, isRead: true }))
            );

            if (onNotificationRead) {
                onNotificationRead();
            }

            if (onClose) {
                onClose();
            }
        } catch (error) {
            console.error('모든 알림 읽음 처리 실패:', error);
        }
    };

    // 알림 타입에 따른 아이콘 반환
    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'CHAT':
                return <ChatIcon color="primary" />;
            case 'RESERVATION':
                return <EventIcon color="secondary" />;
            case 'REVIEW':
                return <RateReviewIcon color="success" />;
            default:
                return <InfoIcon color="info" />;
        }
    };

    // 날짜 포맷팅 함수
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffSec = Math.floor(diffMs / 1000);
        const diffMin = Math.floor(diffSec / 60);
        const diffHour = Math.floor(diffMin / 60);
        const diffDay = Math.floor(diffHour / 24);

        if (diffSec < 60) {
            return '방금 전';
        } else if (diffMin < 60) {
            return `${diffMin}분 전`;
        } else if (diffHour < 24) {
            return `${diffHour}시간 전`;
        } else if (diffDay < 7) {
            return `${diffDay}일 전`;
        } else {
            return date.toLocaleDateString();
        }
    };

    if (loading) {
        return (
            <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                p={3}
                minHeight={200}
            >
                <CircularProgress size={30} />
                <Typography variant="body2" sx={{ ml: 2 }}>
                    알림을 불러오는 중...
                </Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ width: '100%', maxHeight: 400, overflow: 'auto' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" p={1}>
                <Typography variant="subtitle1" fontWeight="bold">
                    알림
                </Typography>
                {notifications.length > 0 && (
                    <Button
                        size="small"
                        startIcon={<MarkChatReadIcon />}
                        onClick={handleMarkAllAsRead}
                    >
                        모두 읽음
                    </Button>
                )}
            </Box>

            <Divider />

            {notifications.length === 0 ? (
                <Box p={3} textAlign="center">
                    <Typography color="text.secondary">
                        알림이 없습니다
                    </Typography>
                </Box>
            ) : (
                <List sx={{ width: '100%', padding: 0 }}>
                    {notifications.map((notification) => (
                        <React.Fragment key={notification.id}>
                            <ListItem
                                alignItems="flex-start"
                                onClick={() => handleNotificationClick(notification)}
                                sx={{
                                    cursor: 'pointer',
                                    bgcolor: notification.read ? 'transparent' : 'rgba(25, 118, 210, 0.08)',
                                    transition: 'background-color 0.3s',
                                    '&:hover': {
                                        bgcolor: 'rgba(0, 0, 0, 0.04)'
                                    },
                                    padding: 2
                                }}
                            >
                                <Box sx={{ mr: 2, display: 'flex', alignItems: 'flex-start' }}>
                                    {getNotificationIcon(notification.notificationType)}
                                </Box>
                                <ListItemText
                                    primary={
                                        <Typography component="span" variant="subtitle2" color="text.primary">
                                            {notification.title}
                                        </Typography>
                                    }
                                    secondary={
                                        <>
                                            <Typography component="span" variant="body2" color="text.primary" sx={{ display: 'block' }}>
                                                {notification.content}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                                                {formatDate(notification.createdAt)}
                                            </Typography>
                                        </>
                                    }
                                />
                            </ListItem>
                            <Divider component="li" />
                        </React.Fragment>
                    ))}
                </List>
            )}
        </Box>
    );
};

export default NotificationList;