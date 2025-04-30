import React, { useEffect, useState } from 'react';
import { Snackbar, Alert, AlertTitle, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ChatIcon from '@mui/icons-material/Chat';
import EventIcon from '@mui/icons-material/Event';
import RateReviewIcon from '@mui/icons-material/RateReview';
import InfoIcon from '@mui/icons-material/Info';
import NotificationService, { AlarmDto } from '../../services/notification/NotificationService';
import { useNavigate } from 'react-router-dom';

const NotificationToast: React.FC = () => {
    const [open, setOpen] = useState<boolean>(false);
    const [notification, setNotification] = useState<AlarmDto | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        // 새 알림 수신 핸들러
        const handleNewNotification = (newNotification: AlarmDto) => {
            // 현재 앱이 포커스 중이면 토스트 표시
            if (document.hasFocus()) {
                console.log('토스트 알림 표시:', newNotification);
                setNotification(newNotification);
                setOpen(true);

                // 알림 소리 재생 (선택 사항)
                playNotificationSound();
            }
        };

        // 알림 리스너 등록
        NotificationService.addListener(handleNewNotification);

        // 컴포넌트 언마운트 시 리스너 제거
        return () => {
            NotificationService.removeListener(handleNewNotification);
        };
    }, []);

    const handleClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === 'clickaway') {
            return;
        }
        setOpen(false);
    };

    const handleClick = async () => {
        if (notification) {
            // 알림 읽음 처리
            try {
                await NotificationService.markAsRead(notification.id);

                // 알림 타입에 따라 다른 페이지로 이동
                if (notification.notificationType === 'CHAT' && notification.referenceId) {
                    navigate(`/chat/${notification.referenceId}`);
                } else if (notification.notificationType === 'RESERVATION') {
                    navigate('/myPage/appointments');
                } else if (notification.notificationType === 'REVIEW') {
                    navigate('/myPage'); // 또는 리뷰 관련 페이지
                }
            } catch (error) {
                console.error('알림 읽음 처리 실패:', error);
            }
        }
        setOpen(false);
    };

    // 알림 소리 재생 함수
    const playNotificationSound = () => {
        // 간단한 비프음 재생 (선택 사항)
        try {
            const audio = new Audio('/notification-sound.mp3'); // 실제 소리 파일 경로로 변경
            audio.volume = 0.5; // 볼륨 설정
            audio.play().catch(e => console.log('알림 소리 재생 실패:', e));
        } catch (e) {
            console.log('알림 소리 재생 중 오류:', e);
        }
    };

    // 알림 타입에 따른 아이콘 및 색상 설정
    const getAlertProps = (type: string) => {
        switch (type) {
            case 'CHAT':
                return { icon: <ChatIcon />, severity: 'info' as const };
            case 'RESERVATION':
                return { icon: <EventIcon />, severity: 'success' as const };
            case 'REVIEW':
                return { icon: <RateReviewIcon />, severity: 'warning' as const };
            default:
                return { icon: <InfoIcon />, severity: 'info' as const };
        }
    };

    if (!notification) return null;

    const { icon, severity } = getAlertProps(notification.notificationType);

    return (
        <Snackbar
            open={open}
            autoHideDuration={6000}
            onClose={handleClose}
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            sx={{
                maxWidth: { xs: '100%', sm: 400 },
                minWidth: { xs: '90%', sm: 344 }
            }}
        >
            <Alert
                onClose={handleClose}
                severity={severity}
                sx={{
                    width: '100%',
                    cursor: 'pointer',
                    boxShadow: 3,
                    '& .MuiAlert-icon': {
                        display: 'flex',
                        alignItems: 'center'
                    }
                }}
                onClick={handleClick}
                icon={icon}
                action={
                    <IconButton
                        aria-label="close"
                        color="inherit"
                        size="small"
                        onClick={(e) => {
                            e.stopPropagation(); // 상위 요소 클릭 이벤트 전파 방지
                            handleClose(e);
                        }}
                    >
                        <CloseIcon fontSize="inherit" />
                    </IconButton>
                }
            >
                <AlertTitle>{notification.title}</AlertTitle>
                {notification.content}
            </Alert>
        </Snackbar>
    );
};

export default NotificationToast;