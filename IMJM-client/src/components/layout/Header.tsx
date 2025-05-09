import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Header.css';
import logo from '../../assets/images/IMJM-logo-Regi.png';
import {
    Select,
    SelectChangeEvent,
    MenuItem,
    Badge,
    Popover,
    Box,
    IconButton,
    styled,
    alpha,
    Fade
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import LanguageIcon from '@mui/icons-material/Language';
import LoginIcon from '@mui/icons-material/Login';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import NotificationList from '../notification/NotificationList';
import NotificationService from '../../services/notification/NotificationService';
import axios from 'axios';

type Language = 'ko' | 'en';

// 스타일링된 컴포넌트들
const StyledHeader = styled('header')(({ theme }) => ({
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    height: 'var(--header-height)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0 1rem',
    backgroundColor: '#FFF',
    borderBottom: '1px solid #f0f0f0',
    zIndex: 500,
    maxWidth: '600px',
    margin: '0 auto',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
}));

const Logo = styled('img')({
    height: '38px',
    width: '115px',
    marginLeft: '5px',
    cursor: 'pointer',
    transition: 'transform 0.2s ease',
    '&:hover': {
        transform: 'scale(1.03)',
    },
});

const HeaderActions = styled(Box)({
    display: 'flex',
    alignItems: 'center',
    gap: '0.8rem',
});

const StyledSelect = styled(Select)(({ theme }) => ({
    height: '36px',
    borderRadius: '18px',
    fontSize: '0.85rem',
    color: '#555',
    '& .MuiOutlinedInput-notchedOutline': {
        border: '1px solid #eaeaea',
    },
    '&:hover .MuiOutlinedInput-notchedOutline': {
        borderColor: '#FDC7BF',
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
        borderColor: '#FF9080',
        borderWidth: '1px',
    },
    '& .MuiSelect-select': {
        paddingLeft: '12px',
        paddingRight: '12px',
        display: 'flex',
        alignItems: 'center',
    },
}));

const LoginButton = styled('button')(({ theme }) => ({
    backgroundColor: '#FF9080',
    color: 'white',
    border: 'none',
    borderRadius: '18px',
    padding: '7px 16px',
    fontSize: '14px',
    cursor: 'pointer',
    height: '36px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
    boxShadow: '0 2px 6px rgba(255,144,128,0.2)',
    '&:hover': {
        backgroundColor: '#ff8070',
        boxShadow: '0 3px 8px rgba(255,144,128,0.3)',
        transform: 'translateY(-1px)',
    },
    '& svg': {
        marginRight: '6px',
        fontSize: '18px',
    },
}));

const StyledNotificationIcon = styled(NotificationsIcon)(({ theme }) => ({
    color: '#777',
    transition: 'color 0.2s ease',
    '&:hover': {
        color: '#FF9080',
    },
}));

function Header(): React.ReactElement {
    const [language, setLanguage] = useState<Language>('ko');
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
    const [notificationAnchorEl, setNotificationAnchorEl] = useState<null | HTMLElement>(null);
    const [unreadCount, setUnreadCount] = useState<number>(0);
    const navigate = useNavigate();

    const isNotificationOpen = Boolean(notificationAnchorEl);

    useEffect(() => {
        const savedLanguage = localStorage.getItem('language') as Language;
        if (savedLanguage) {
            setLanguage(savedLanguage);
        }

        const checkLoginStatus = async () => {
            try {
                const response = await axios.get('/api/user/check-login', {
                    withCredentials: true
                });
                setIsLoggedIn(true);
                fetchUnreadCount();
            } catch (error) {
                setIsLoggedIn(false);
            }
        };

        checkLoginStatus();
    }, []);

    const fetchUnreadCount = async () => {
        try {
            // 언어 설정과 알림 카운트를 별도로 가져오기
            const langResponse = await axios.get('/api/user/language');
            if (langResponse.data && langResponse.data.language) {
                setLanguage(langResponse.data.language.toLowerCase() as Language);
            }

            const count = await NotificationService.getUnreadCount();
            setUnreadCount(count);
        } catch (error) {
            console.error('읽지 않은 알림 수 조회 실패:', error);
        }
    };

    useEffect(() => {
        if (isLoggedIn) {
            fetchUnreadCount();

            const handleNewNotification = () => {
                fetchUnreadCount();
            };

            const handleReadNotification = () => {
                fetchUnreadCount();
            };

            const handleConnectionChange = (connected: boolean) => {
                if (connected) {
                    fetchUnreadCount();
                }
            };

            NotificationService.addListener(handleNewNotification);
            NotificationService.addListener('alarmRead', handleReadNotification);
            NotificationService.addListener('connectionChange', handleConnectionChange);
            window.addEventListener('focus', fetchUnreadCount);

            const intervalId = setInterval(fetchUnreadCount, 30000);

            return () => {
                NotificationService.removeListener(handleNewNotification);
                NotificationService.removeListener('alarmRead', handleReadNotification);
                NotificationService.removeListener('connectionChange', handleConnectionChange);
                window.removeEventListener('focus', fetchUnreadCount);
                clearInterval(intervalId);
            };
        }
    }, [isLoggedIn]);

    const handleLanguageChange = async (event: SelectChangeEvent<Language>) => {
        const newLanguage = event.target.value as Language;
        setLanguage(newLanguage);

        // 로컬 스토리지에 저장
        localStorage.setItem('language', newLanguage);

        // 언어 변경 이벤트 발생
        window.dispatchEvent(new Event('languageChange'));

        // 로그인된 경우 서버에도 저장
        if (isLoggedIn) {
            try {
                await axios.put('/api/user/language', null, {
                    params: { language: newLanguage },
                    withCredentials: true
                });
            } catch (error) {
                console.error('언어 설정 저장 실패:', error);
            }
        }
    };
    
    const navigateToLogin = (): void => {
        navigate('/login');
    };

    const handleNotificationClick = (event: React.MouseEvent<HTMLElement>) => {
        setNotificationAnchorEl(event.currentTarget);
    };

    const handleNotificationClose = () => {
        fetchUnreadCount();
        setNotificationAnchorEl(null);
    };

    return (
        <StyledHeader>
            <Logo
                src={logo}
                className="logo"
                alt="IMJM 로고"
                onClick={() => navigate('/')}
            />

            <HeaderActions>
                <StyledSelect
                    value={language}
                    onChange={handleLanguageChange}
                    variant="outlined"
                    size="small"
                    sx={{
                        minWidth: '120px',
                        '& .MuiSelect-select': {
                            display: 'flex',
                            alignItems: 'center',
                            paddingRight: '28px', // 화살표 아이콘을 위한 공간 확보
                        }
                    }}
                    // 기본 드롭다운 아이콘은 제거
                    IconComponent={() => null}
                    // 시작 부분에 언어 아이콘
                    startAdornment={<LanguageIcon sx={{ fontSize: 16, mr: 1, color: '#777' }} />}
                    // 끝 부분에 화살표 아이콘 추가
                    endAdornment={<ArrowDropDownIcon sx={{ fontSize: 20, color: '#777', position: 'absolute', right: 8 }} />}
                >
                    <MenuItem value="KR" sx={{
                        '&.Mui-selected': {
                            backgroundColor: alpha('#FDC7BF', 0.1),
                            '&:hover': {
                                backgroundColor: alpha('#FDC7BF', 0.2)
                            }
                        },
                        '&:hover': {
                            backgroundColor: alpha('#FDC7BF', 0.1)
                        }
                    }}>
                        한국어
                    </MenuItem>
                    <MenuItem value="EN" sx={{
                        '&.Mui-selected': {
                            backgroundColor: alpha('#FDC7BF', 0.1),
                            '&:hover': {
                                backgroundColor: alpha('#FDC7BF', 0.2)
                            }
                        },
                        '&:hover': {
                            backgroundColor: alpha('#FDC7BF', 0.1)
                        }
                    }}>
                        English
                    </MenuItem>
                </StyledSelect>

                {isLoggedIn ? (
                    <IconButton
                        color="inherit"
                        onClick={handleNotificationClick}
                        sx={{
                            position: 'relative',
                            backgroundColor: isNotificationOpen ? alpha('#FDC7BF', 0.1) : 'transparent',
                            transition: 'background-color 0.2s ease',
                            '&:hover': {
                                backgroundColor: alpha('#FDC7BF', 0.1)
                            }
                        }}
                    >
                        <Badge
                            badgeContent={unreadCount}
                            color="error"
                            sx={{
                                '& .MuiBadge-badge': {
                                    backgroundColor: '#FF9080',
                                    fontSize: '0.7rem',
                                    height: '20px',
                                    minWidth: '20px',
                                    padding: '0 6px',
                                }
                            }}
                        >
                            <StyledNotificationIcon />
                        </Badge>
                    </IconButton>
                ) : (
                    <LoginButton onClick={navigateToLogin}>
                        <LoginIcon />
                        {language === 'ko' ? '로그인' : 'Login'}
                    </LoginButton>
                )}

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
                    sx={{
                        mt: 1.5,
                        '& .MuiPopover-paper': {
                            overflow: 'visible',
                            boxShadow: '0 6px 16px rgba(0,0,0,0.12)',
                            '&::before': {
                                content: '""',
                                display: 'block',
                                position: 'absolute',
                                top: -6,
                                right: 14,
                                width: 12,
                                height: 12,
                                backgroundColor: 'white',
                                transform: 'rotate(45deg)',
                                boxShadow: '-3px -3px 5px rgba(0,0,0,0.04)',
                                zIndex: 0
                            }
                        }
                    }}
                    TransitionComponent={Fade}
                    transitionDuration={150}
                >
                    <Box sx={{ width: { xs: 320, sm: 360 }, maxHeight: 400 }}>
                        <NotificationList
                            onNotificationRead={fetchUnreadCount}
                            onClose={handleNotificationClose}
                        />
                    </Box>
                </Popover>
            </HeaderActions>
        </StyledHeader>
    );
}

export default Header;