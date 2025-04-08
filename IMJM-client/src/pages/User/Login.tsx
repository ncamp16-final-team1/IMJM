import { Container, TextField, Button, Typography, Box, Paper } from '@mui/material';

const Login = () => {

    const handleGoogleLogin = () => {
        // 실제 구글 로그인 URL로 리다이렉트
        window.location.href = 'http://localhost:8080/oauth2/authorization/google';
    };

    const handleAppleLogin = () => {
        const ua = navigator.userAgent.toLowerCase();
        const isSafari = ua.includes('safari') && !ua.includes('chrome');

        if (!isSafari) {
            alert('애플 로그인은 Safari 브라우저에서만 지원됩니다.\nSafari에서 다시 시도해 주세요.');
            return;
        }

        // 실제 애플 로그인 URL로 리다이렉트
        window.location.href = 'https://localhost:8080/oauth2/authorization/apple';
    };

    return (
        <Container maxWidth="sm" sx={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
                <Typography variant="h5" gutterBottom>IMJM 로그인</Typography>

                <Box sx={{ mt: 3 }}>
                    <Button
                        variant="contained"
                        fullWidth
                        onClick={handleGoogleLogin}
                        sx={{
                            mb: 2,
                            bgcolor: '#4285F4',
                            color: '#fff',
                            '&:hover': { bgcolor: '#357ae8' }
                        }}
                    >
                        구글로 로그인
                    </Button>

                    <Button
                        variant="contained"
                        fullWidth
                        onClick={handleAppleLogin}
                        sx={{
                            bgcolor: '#000000',
                            color: '#fff',
                            '&:hover': { bgcolor: '#333' }
                        }}
                    >
                        애플로 로그인
                    </Button>
                </Box>
            </Paper>
        </Container>
    );
};

export default Login;