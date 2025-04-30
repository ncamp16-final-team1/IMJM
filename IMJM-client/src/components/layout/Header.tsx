import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Header.css';
import logo from '../../assets/images/logo.png';
import MenuItem from '@mui/material/MenuItem';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import NotificationsIcon from '@mui/icons-material/Notifications';
import axios from 'axios';
import { Popover, Box, Badge } from '@mui/material';
import NotificationList from '../notification/NotificationList';
import NotificationService from '../../services/notification/NotificationService';

// 언어 타입 정의
type Language = 'ko' | 'en';

function Header(): React.ReactElement {
    const [language, setLanguage] = useState<Language>('ko');
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false); // 로그인 상태 추적
    const [notificationAnchorEl, setNotificationAnchorEl] = useState<null | HTMLElement>(null);
    const [unreadCount, setUnreadCount] = useState<number>(0); // 읽지 않은 알림 수
    const navigate = useNavigate();

    // 알림 팝오버 상태
    const isNotificationOpen = Boolean(notificationAnchorEl);

    // 로그인 상태 확인
    useEffect(() => {
        const checkLoginStatus = async () => {
            try {
                const response = await axios.get('/api/user/check-login');
                setIsLoggedIn(true);

                // 로그인됐을 때만 읽지 않은 알림 수 가져오기
                fetchUnreadCount();
            } catch (error) {
                setIsLoggedIn(false);
            }
        };

        checkLoginStatus();
    }, []);

    // 읽지 않은 알림 수 가져오기
    const fetchUnreadCount = async () => {
        try {
            const count = await NotificationService.getUnreadCount();
            setUnreadCount(count);
            console.log('읽지 않은 알림 수:', count);
        } catch (error) {
            console.error('읽지 않은 알림 수 조회 실패:', error);
        }
    };

    // 알림 이벤트 구독
    useEffect(() => {
        if (isLoggedIn) {
            // 카운트 변경 이벤트 구독
            const handleCountChange = (count: number) => {
                console.log('알림 카운트 변경:', count);
                setUnreadCount(count);
            };

            // 새 알림 이벤트 구독 (이전 방식과의 호환성)
            const handleNewNotification = () => {
                fetchUnreadCount(); // 새 알림이 오면 카운트 다시 가져오기
            };

            // 이벤트 리스너 등록
            try {
                NotificationService.addEventListener('countChange', handleCountChange);
                NotificationService.addListener(handleNewNotification);
            } catch (error) {
                console.error('알림 이벤트 구독 실패:', error);
            }

            return () => {
                // 컴포넌트 언마운트 시 이벤트 리스너 제거
                try {
                    NotificationService.removeEventListener('countChange', handleCountChange);
                    NotificationService.removeListener(handleNewNotification);
                } catch (error) {
                    console.error('알림 이벤트 구독 해제 실패:', error);
                }
            };
        }
    }, [isLoggedIn]);

    const handleLanguageChange = (event: SelectChangeEvent<Language>): void => {
        setLanguage(event.target.value as Language);
    };

    // 로그인 페이지로 이동
    const navigateToLogin = (): void => {
        navigate('/login');
    };

    // 알림 클릭 핸들러
    const handleNotificationClick = (event: React.MouseEvent<HTMLElement>) => {
        setNotificationAnchorEl(event.currentTarget);
    };

    // 알림 닫기 핸들러
    const handleNotificationClose = () => {
        setNotificationAnchorEl(null);
    };

    return (
        <header className="header">
            <div className="logoimage">
                <img
                    src={logo}
                    className="logo"
                    alt="로고"
                    onClick={() => navigate('/')}
                />
            </div>
            <div className="header-actions">
                <Select
                    value={language}
                    onChange={handleLanguageChange}
                    className="language-select"
                    variant="outlined"
                    sx={{
                        height: '30px',
                        borderRadius: '20px',
                        border: '1px solid #f39c91',
                        color: '#f39c91',
                        '& .MuiOutlinedInput-notchedOutline': {
                            border: 'none'
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                            border: 'none'
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            border: 'none'
                        }
                    }}
                >
                    <MenuItem value={'ko'}>한국어</MenuItem>
                    <MenuItem value={'en'}>English</MenuItem>
                </Select>

                {isLoggedIn ? (
                    // 로그인되어 있을 때 알림 버튼 표시
                    <div className="header-icons">
                        <button className="icon-button" onClick={handleNotificationClick}>
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
                        </button>

                        {/* 알림 팝오버 */}
                        <Popover
                            open={isNotificationOpen}
                            anchorEl={notificationAnchorEl}
                            onClose={handleNotificationClose}
                            anchorOrigin={{
                                vertical: 'bottom',
                                horizontal: 'right',
                            }}
                            transformOrigin={{
                                vertical: 'top',
                                horizontal: 'right',
                            }}
                            sx={{ mt: 1 }}
                        >
                            <Box sx={{ width: { xs: 320, sm: 360 }, maxHeight: 400 }}>
                                <NotificationList />
                            </Box>
                        </Popover>
                    </div>
                ) : (
                    <button
                        className="login-button"
                        onClick={navigateToLogin}
                    >
                        {language === 'ko' ? '로그인' : 'Login'}
                    </button>
                )}
            </div>
        </header>
    );
}

export default Header;