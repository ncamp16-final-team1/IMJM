import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import logoImage from '../../assets/images/IMJM-logo.png';
import {
    Box,
    Container,
    TextField,
    Button,
    Typography,
    Paper
} from '@mui/material';

// Props 인터페이스 정의
interface LoginProps {
    onLoginSuccess: () => void;
}

function Login({ onLoginSuccess }: LoginProps) {
    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const navigate = useNavigate();

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        try {
            const response = await fetch('/api/admin/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    id: username, 
                    password: password,
                }),
                credentials: 'include', 
            });

            if (response.ok) {
                onLoginSuccess(); 
                navigate('/');
            } else {
                alert('로그인 실패: 아이디나 비밀번호를 확인하세요.');
            }
        } catch (error) {
            console.error('로그인 요청 중 오류:', error);
            alert('서버 오류가 발생했습니다.');
        }
    };

    const handleNavigateToRegister = () => {
        navigate('/admin/register');
    };

    return (
        <Container component="main" maxWidth="sm" sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
            <Paper elevation={0} sx={{ padding: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Box>
                    <img
                        src={logoImage}
                        alt="IMJM Logo"
                        width="300"
                        height="300"
                    />
                </Box>

                <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%', maxWidth: '400px' }}>
                    <Typography component="label" sx={{ mb: 1, display: 'block' }}>
                        아이디
                    </Typography>
                    <TextField
                        margin="none"
                        required
                        fullWidth
                        id="username"
                        name="username"
                        autoComplete="username"
                        autoFocus
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        variant="outlined"
                        sx={{ mb: 3 }}
                    />

                    <Typography component="label" sx={{ mb: 1, display: 'block' }}>
                        비밀번호
                    </Typography>
                    <TextField
                        margin="none"
                        required
                        fullWidth
                        name="password"
                        type="password"
                        id="password"
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        variant="outlined"
                        sx={{ mb: 3 }}
                    />

                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{
                            mt: 2,
                            mb: 2,
                            py: 1.5,
                            bgcolor: '#ff6f61',
                            boxShadow: 'none',
                            '&:hover': {
                                bgcolor: '#FF9080',
                                boxShadow: 'none',
                            }
                        }}
                    >
                        로그인
                    </Button>

                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
                        <Typography variant="body2" sx={{ mr: 1 }}>
                            Create an account
                        </Typography>
                        <Typography
                            variant="body2"
                            sx={{ color: '#ff6f61', cursor: 'pointer' }}
                            onClick={handleNavigateToRegister}
                        >
                            Sign Up
                        </Typography>
                    </Box>
                </Box>
            </Paper>
        </Container>
    );
}

export default Login;