import React from 'react';
import './Footer.css';
// Material UI 아이콘 임포트
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import PeopleIcon from '@mui/icons-material/People';
import HomeIcon from '@mui/icons-material/Home';
import ContentCutIcon from '@mui/icons-material/ContentCut';
import PersonIcon from '@mui/icons-material/Person';

function Footer({ currentPage, setCurrentPage }) {
    const navItems = [
        { id: 'archive', icon: <PhotoCamera />, label: 'archive' },
        { id: 'community', icon: <PeopleIcon />, label: 'community' },
        { id: 'home', icon: <HomeIcon />, label: 'home' },
        { id: 'hairSalon', icon: <ContentCutIcon />, label: 'hair salon' },
        { id: 'myPage', icon: <PersonIcon />, label: 'my page' }
    ];

    return (
        <nav className="footer">
            {navItems.map(item => (
                <button
                    key={item.id}
                    className={`nav-item ${currentPage === item.id ? 'active' : ''}`}
                    onClick={() => setCurrentPage(item.id)}
                >
                    <div className="nav-icon">{item.icon}</div>
                    <div className="nav-label">{item.label}</div>
                </button>
            ))}
        </nav>
    );
}

export default Footer;