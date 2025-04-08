import React, { useState } from 'react';
import './Header.css';
import logo from '../../assets/images/logo.png';
import MenuItem from '@mui/material/MenuItem';
import Select, { SelectChangeEvent } from '@mui/material/Select';

import ChatIcon from '@mui/icons-material/Chat';
import NotificationsIcon from '@mui/icons-material/Notifications';

// 언어 타입 정의
type Language = 'ko' | 'en';

function Header(): React.ReactElement {
    const [language, setLanguage] = useState<Language>('ko'); // 기본값을 한글(ko)로 설정

    const handleLanguageChange = (event: SelectChangeEvent<Language>): void => {
        setLanguage(event.target.value as Language);
    };

    return (
        <header className="header">
            <div className="logoimage">
                <img src={logo} className="logo" alt="로고" />
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
                <div className="header-icons">
                    <button className="icon-button">
                        <ChatIcon />
                    </button>
                    <button className="icon-button">
                        <NotificationsIcon />
                        <span className="notification-badge">1</span>
                    </button>
                </div>
            </div>
        </header>
    );
}

export default Header;