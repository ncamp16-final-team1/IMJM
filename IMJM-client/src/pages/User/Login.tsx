import { Container, Button, Box } from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import AppleIcon from '@mui/icons-material/Apple';
import logoImage from '../../assets/images/logo.png';
import { API_BASE_URL } from '../../config';
import { useEffect } from 'react';

const Login = () => {

    const handleGoogleLogin = () => {
        window.location.href = `${API_BASE_URL}/oauth2/authorization/google`;
    };

    const handleAppleLogin = () => {
        const ua = navigator.userAgent.toLowerCase();
        const isSafari = ua.includes('safari') && !ua.includes('chrome');

        if (!isSafari) {
            alert('애플 로그인은 Safari 브라우저에서만 지원됩니다.\nSafari에서 다시 시도해 주세요.\n비싸서 못삼...');
            return;
        }

        window.location.href = `${API_BASE_URL}/oauth2/authorization/apple`;
    };

    useEffect(() => {
        fetch("/oauth2/redirect")
            .then((res) => res.json())
            .then((data) => {
                document.cookie = `Authorization=${data.token}; path=/; secure; samesite=None`;
                window.location.replace(data.redirectUrl); // 프론트에서 URL로 리디렉션
            });
    }, []);
    
    return (
        <Container maxWidth="xs" sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative' }}>
            {/* 중앙 로그인 콘텐츠 */}
            <Box sx={{ textAlign: 'center', mt: 'auto', mb: 'auto' }}>
                <Box>
                    <img
                        src={logoImage}
                        alt="IMJM Logo"
                        width="300"
                        height="300"
                    />
                </Box>
                <Box sx={{ mb: 3, color: '#aaa' }}>- Or continue with -</Box>
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3 }}>
                    <Button
                        onClick={handleGoogleLogin}
                        sx={{
                            minWidth: '60px',
                            height: '60px',
                            borderRadius: '50%',
                            border: '1px solid #ccc',
                        }}
                    >
                        <GoogleIcon fontSize="large" sx={{ color: '#4285F4' }} />
                    </Button>
                    <Button
                        onClick={handleAppleLogin}
                        sx={{
                            minWidth: '60px',
                            height: '60px',
                            borderRadius: '50%',
                            border: '1px solid #ccc',
                        }}
                    >
                        <AppleIcon fontSize="large" sx={{ color: '#000' }} />
                    </Button>
                </Box>
            </Box>
        </Container>
    );
};

export default Login;
