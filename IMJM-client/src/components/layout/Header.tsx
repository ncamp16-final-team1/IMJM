import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Header.css';
import logo from '../../assets/images/IMJM-logo-Regi.png';
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

    // 로그인 상태 확인 및 초기 unreadCount 설정
    useEffect(() => {
        const checkLoginStatus = async () => {
            try {
                const response = await axios.get('/api/user/check-login', {
                    withCredentials: true
                });
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
            console.log('읽지 않은 알림 수 가져옴:', count);
            setUnreadCount(count);
        } catch (error) {
            console.error('읽지 않은 알림 수 조회 실패:', error);
        }
    };

    // 알림 관련 이벤트 구독
    useEffect(() => {
        if (isLoggedIn) {
            // 초기 읽지 않은 알림 수 가져오기
            fetchUnreadCount();

            // 새 알림이 왔을 때 카운트 증가
            const handleNewNotification = () => {
                console.log('새 알림 발생, 카운트 증가');
                fetchUnreadCount(); // 즉시 서버에서 최신 카운트 가져오기
            };

            // 알림을 읽었을 때 카운트 감소
            const handleReadNotification = () => {
                console.log('알림 읽음 처리됨, unreadCount 업데이트');
                fetchUnreadCount(); // 서버에서 최신 카운트 가져오기
            };

            // 웹소켓 연결 상태 변화에 대응
            const handleConnectionChange = (connected: boolean) => {
                if (connected) {
                    console.log('웹소켓 연결됨, unreadCount 업데이트');
                    fetchUnreadCount();
                }
            };

            // 모든 이벤트 리스너 등록
            NotificationService.addListener(handleNewNotification);

            // 읽음 처리 이벤트 리스너 등록 (알림 서비스에 해당 이벤트 지원 필요)
            NotificationService.addListener('alarmRead', handleReadNotification);

            // 연결 상태 변화 감지 (알림 서비스에 해당 이벤트 지원 필요)
            NotificationService.addListener('connectionChange', handleConnectionChange);

            // 페이지 포커스될 때 업데이트
            window.addEventListener('focus', fetchUnreadCount);

            // 백그라운드에서도 주기적으로 업데이트 (30초마다)
            const intervalId = setInterval(fetchUnreadCount, 30000);

            return () => {
                // 모든 이벤트 리스너 제거
                NotificationService.removeListener(handleNewNotification);
                NotificationService.removeListener('alarmRead', handleReadNotification);
                NotificationService.removeListener('connectionChange', handleConnectionChange);
                window.removeEventListener('focus', fetchUnreadCount);
                clearInterval(intervalId);
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
        fetchUnreadCount(); // 닫을 때 카운트 업데이트
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
                            // // onEntered와 onExited 이벤트 활용
                            // onEntered={() => console.log('알림창 열림')}
                            // onExited={handleNotificationClose}
                        >
                            <Box sx={{ width: { xs: 320, sm: 360 }, maxHeight: 400 }}>
                                <NotificationList
                                    onNotificationRead={fetchUnreadCount}
                                    onClose={handleNotificationClose} // 모달 닫기 함수 전달
                                />
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