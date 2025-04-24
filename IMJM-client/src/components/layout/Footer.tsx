import React from 'react';
import './Footer.css';
import { useNavigate, useLocation } from 'react-router-dom';
// Material UI 아이콘 임포트
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import PeopleIcon from '@mui/icons-material/People';
import HomeIcon from '@mui/icons-material/Home';
import ContentCutIcon from '@mui/icons-material/ContentCut';
import PersonIcon from '@mui/icons-material/Person';

// 네비게이션 아이템 타입 정의
interface NavItem {
    id: string;
    path: string;
    icon: React.ReactNode;
    label: string;
}

function Footer(): React.ReactElement {
    const navigate = useNavigate();
    const location = useLocation();
    const currentPath = location.pathname;

    const navItems: NavItem[] = [
        { id: 'archive', path: '/archive', icon: <PhotoCamera />, label: 'archive' },
        { id: 'community', path: '/community', icon: <PeopleIcon />, label: 'community' },
        { id: 'home', path: '/', icon: <HomeIcon />, label: 'home' },
        { id: 'hairSalon', path: '/salon', icon: <ContentCutIcon />, label: 'hair salon' },
        { id: 'myPage', path: '/myPage', icon: <PersonIcon />, label: 'my page' }
    ];

    return (
        <nav className="footer">
            {navItems.map(item => (
                <button
                    key={item.id}
                    className={`nav-item ${currentPath === item.path ? 'active' : ''}`}
                    onClick={() => navigate(item.path)}
                >
                    <div className="nav-icon">{item.icon}</div>
                    <div className="nav-label">{item.label}</div>
                </button>
            ))}
        </nav>
    );
}

export default Footer;