import React, { useState, useEffect, useContext } from 'react';
import { Snackbar, Alert, useMediaQuery, useTheme } from '@mui/material';
import NotificationService, { AlarmDto } from '../../services/notification/NotificationService';
import { useNavigate } from 'react-router-dom';

export const NotificationContext = React.createContext<{
    showNotification: (message: string, type: 'success' | 'info' | 'warning' | 'error', duration?: number) => void;
}>({
    showNotification: () => {},
});

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [open, setOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [severity, setSeverity] = useState<'success' | 'info' | 'warning' | 'error'>('info');
    const [duration, setDuration] = useState(4000);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const showNotification = (
        message: string,
        type: 'success' | 'info' | 'warning' | 'error' = 'info',
        duration: number = 4000
    ) => {
        setMessage(message);
        setSeverity(type);
        setDuration(duration);
        setOpen(true);
    };

    const handleClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === 'clickaway') {
            return;
        }
        setOpen(false);
    };

    // 색상 매핑 함수 - 앱의 디자인 시스템에 맞게 색상 설정
    const getAlertColor = (type: 'success' | 'info' | 'warning' | 'error') => {
        switch (type) {
            case 'success':
                return '#4CAF50';
            case 'warning':
                return '#FFC107';
            case 'error':
                return '#F44336';
            case 'info':
            default:
                return '#FF9080'; // 앱의 주요 색상
        }
    };

    return (
        <NotificationContext.Provider value={{ showNotification }}>
            {children}
            <Snackbar
                open={open}
                autoHideDuration={duration}
                onClose={handleClose}
                anchorOrigin={{
                    vertical: isMobile ? 'bottom' : 'top',
                    horizontal: 'center'
                }}
                sx={{
                    width: isMobile ? '100%' : 'auto',
                    maxWidth: { xs: '100%', sm: 400 },
                    bottom: isMobile ? '60px' : 'auto', // Footer 높이를 고려한 위치 조정
                }}
            >
                <Alert
                    onClose={handleClose}
                    severity={severity}
                    variant="filled"
                    sx={{
                        width: '100%',
                        padding: isMobile ? '12px 16px' : '8px 16px',
                        fontSize: { xs: '14px', sm: '16px' },
                        borderRadius: '8px',
                        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                        backgroundColor: '#ffffff', // 흰색 배경
                        color: '#333333', // 어두운 텍스트 색상
                        border: '1px solid #f1f1f1',
                        '& .MuiAlert-icon': {
                            color: getAlertColor(severity), // 종류에 따른 아이콘 색상
                        },
                        '& .MuiAlert-message': {
                            color: '#333333', // 메시지 텍스트 색상
                        },
                        '& .MuiAlert-action': {
                            color: '#666666', // 닫기 버튼 색상
                        },
                    }}
                    icon={false} // 기본 아이콘 비활성화
                >
                    {message}
                </Alert>
            </Snackbar>
        </NotificationContext.Provider>
    );
};

export const InAppNotificationReceiver: React.FC = () => {
    const { showNotification } = useContext(NotificationContext);
    const navigate = useNavigate();

    useEffect(() => {
        const handleNewNotification = (notification: AlarmDto) => {
            if (!notification || !notification.title) {
                console.warn("유효하지 않은 알림 데이터:", notification);
                return;
            }

            const message = `${notification.title}: ${notification.content.substring(0, 50)}${notification.content.length > 50 ? '...' : ''}`;

            let severity: 'success' | 'info' | 'warning' | 'error' = 'info';
            switch (notification.notificationType) {
                case 'CHAT':
                    severity = 'info';
                    break;
                case 'RESERVATION':
                    severity = 'success';
                    break;
                case 'REVIEW':
                    severity = 'warning';
                    break;
                default:
                    severity = 'info';
            }

            showNotification(message, severity, 5000);
        };

        NotificationService.addListener(handleNewNotification);
        NotificationService.addListener('notification', handleNewNotification);

        return () => {
            NotificationService.removeListener(handleNewNotification);
            NotificationService.removeListener('notification', handleNewNotification);
        };
    }, [showNotification, navigate]);

    return null;
};