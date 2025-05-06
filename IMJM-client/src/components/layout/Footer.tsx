import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Paper,
    Box,
    Typography,
    styled
} from '@mui/material';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import ChatBubbleIcon from '@mui/icons-material/ChatBubble';
import HomeIcon from '@mui/icons-material/Home';
import ContentCutIcon from '@mui/icons-material/ContentCut';
import PersonIcon from '@mui/icons-material/Person';

interface NavItem {
    id: string;
    path: string;
    icon: React.ReactElement;
    label: string;
}

// 스타일링된 컴포넌트
const FooterContainer = styled(Paper)(({ theme }) => ({
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    height: 'var(--nav-height)',
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderTopLeftRadius: '20px',
    borderTopRightRadius: '20px',
    zIndex: 100,
    maxWidth: '600px',
    margin: '0 auto',
    boxShadow: '0 -2px 10px rgba(0,0,0,0.06)',
    padding: '0 12px',
    borderTop: '1px solid #f0f0f0',
}));

// active prop을 사용하는 방식 수정
const NavButton = styled('button', {
    shouldForwardProp: (prop) => prop !== 'active',
})(({ active }: { active: boolean }) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    height: '100%',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '6px 0',
    color: active ? '#FF9080' : '#999',
    transition: 'all 0.3s ease',
    position: 'relative',
    overflow: 'hidden',
    '&:hover': {
        color: '#FF9080',
    },
    '&::after': active ? {
        content: '""',
        position: 'absolute',
        bottom: 0,
        left: '50%',
        transform: 'translateX(-50%)',
        width: '40%',
        height: '3px',
        backgroundColor: '#FF9080',
        borderTopLeftRadius: '3px',
        borderTopRightRadius: '3px',
    } : {},
}));

const IconWrapper = styled(Box)({
    fontSize: '22px',
    marginBottom: '2px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    transition: 'transform 0.2s ease',
    '&:hover': {
        transform: 'translateY(-2px)',
    },
});

const LabelText = styled(Typography)({
    fontSize: '0.7rem',
    fontWeight: 500,
    textTransform: 'capitalize',
    transition: 'all 0.2s ease',
    marginTop: '2px',
});

function Footer(): React.ReactElement {
    const navigate = useNavigate();
    const location = useLocation();
    const currentPath = location.pathname;

    const navItems: NavItem[] = [
        { id: 'archive', path: '/archive', icon: <PhotoCamera />, label: 'archive' },
        { id: 'chat', path: '/chat', icon: <ChatBubbleIcon />, label: 'chat' },
        { id: 'home', path: '/', icon: <HomeIcon />, label: 'home' },
        { id: 'hairSalon', path: '/salon', icon: <ContentCutIcon />, label: 'hair salon' },
        { id: 'myPage', path: '/my', icon: <PersonIcon />, label: 'my page' }
    ];

    // 경로가 정확히 일치하는지 또는 하위 경로인지 확인
    const isActive = (path: string): boolean => {
        if (path === '/') {
            return currentPath === '/';
        }
        return currentPath === path || currentPath.startsWith(`${path}/`);
    };

    return (
        <FooterContainer elevation={3}>
            {navItems.map(item => {
                const active = isActive(item.path);
                return (
                    <NavButton
                        key={item.id}
                        active={active}
                        onClick={() => navigate(item.path)}
                    >
                        <IconWrapper>
                            {React.cloneElement(item.icon as React.ReactElement, {
                                style: { color: active ? '#FF9080' : '#999' }
                            })}
                        </IconWrapper>
                        <LabelText variant="caption">
                            {item.label}
                        </LabelText>
                    </NavButton>
                );
            })}
        </FooterContainer>
    );
}

export default Footer;