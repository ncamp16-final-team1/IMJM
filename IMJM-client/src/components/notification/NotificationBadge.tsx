import React, { useEffect, useState } from 'react';
import { Badge, IconButton } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import NotificationService from '../../services/notification/NotificationService';
import { AlarmDto } from '../../services/notification/NotificationService';

interface NotificationBadgeProps {
    onClick: () => void;
}

const NotificationBadge: React.FC<NotificationBadgeProps> = ({ onClick }) => {
    const [unreadCount, setUnreadCount] = useState<number>(0);

    useEffect(() => {
        // 초기 읽지 않은 알림 수 가져오기
        const fetchUnreadCount = async () => {
            try {
                const count = await NotificationService.getUnreadCount();
                setUnreadCount(count);
            } catch (error) {
                console.error('읽지 않은 알림 수 조회 실패:', error);
            }
        };

        fetchUnreadCount();

        // 새 알림이 도착했을 때 카운트 증가
        const handleNewNotification = (notification: AlarmDto) => {
            console.log('새 알림 수신됨 (배지):', notification);
            setUnreadCount(prev => prev + 1);
        };

        // 알림 리스너 등록
        NotificationService.addListener(handleNewNotification);

        // 컴포넌트 언마운트 시 리스너 제거
        return () => {
            NotificationService.removeListener(handleNewNotification);
        };
    }, []);

    return (
        <IconButton color="inherit" onClick={onClick} sx={{ position: 'relative' }}>
            <Badge
                badgeContent={unreadCount}
                color="error"
                sx={{
                    '& .MuiBadge-badge': {
                        fontSize: '0.7rem',
                        height: '20px',
                        minWidth: '20px',
                        padding: '0 6px',
                    }
                }}
            >
                <NotificationsIcon />
            </Badge>
        </IconButton>
    );
};

export default NotificationBadge;