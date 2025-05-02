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
                    bottom: isMobile ? '56px' : 'auto',
                }}
            >
                <Alert
                    onClose={handleClose}
                    severity={severity}
                    variant="filled"
                    sx={{
                        width: '100%',
                        padding: isMobile ? '12px 16px' : '8px 16px',
                        fontSize: { xs: '14px', sm: '16px' }
                    }}
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