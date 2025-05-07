import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Typography,
    Button,
    Box,
    Paper,
    IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

interface LoginDialogProps {
    open: boolean;
    onClose: () => void;
    onLogin: () => void;
    title?: string;
    message?: string;
    cancelText?: string;
    loginText?: string;
    onAfterLogin?: () => void; 
}

const LoginDialog = ({
                         open,
                         onClose,
                         onLogin,
                         title = '로그인 필요',
                         message = '로그인해야 사용 가능합니다',
                         cancelText = '취소',
                         loginText = '로그인'
                     }: LoginDialogProps) => {
    return (
        <Dialog
            open={open}
            onClose={onClose}
            PaperProps={{
                sx: {
                    borderRadius: '12px',
                    overflow: 'hidden',
                    maxWidth: '360px',
                    width: '100%',
                    boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
                    border: '1px solid #FDC7BF',
                }
            }}
        >
            <Box sx={{ position: 'relative' }}>
                <IconButton
                    size="small"
                    onClick={onClose}
                    sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        color: '#777',
                        '&:hover': {
                            backgroundColor: 'rgba(0,0,0,0.04)',
                        }
                    }}
                >
                    <CloseIcon fontSize="small" />
                </IconButton>

                <Box
                    sx={{
                        bgcolor: '#FDF6F3',
                        py: 3,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        borderBottom: '1px solid rgba(0,0,0,0.05)'
                    }}
                >
                    <Paper
                        elevation={0}
                        sx={{
                            width: 56,
                            height: 56,
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: '#FDC7BF',
                            mb: 2
                        }}
                    >
                        <LockOutlinedIcon sx={{ color: '#fff', fontSize: 28 }} />
                    </Paper>
                    <Typography
                        variant="h6"
                        sx={{
                            fontWeight: 'bold',
                            color: '#333',
                            textAlign: 'center'
                        }}
                    >
                        {title}
                    </Typography>
                </Box>

                <DialogContent
                    sx={{
                        p: 3,
                        pt: 3,
                        textAlign: 'center',
                        backgroundColor: '#fff'
                    }}
                >
                    <Typography variant="body1" color="#555" sx={{ lineHeight: 1.6 }}>
                        {message}
                    </Typography>
                </DialogContent>

                <DialogActions
                    sx={{
                        p: 3,
                        pt: 1,
                        justifyContent: 'center',
                        gap: 2,
                        backgroundColor: '#fff'
                    }}
                >
                    <Button
                        onClick={onClose}
                        variant="outlined"
                        sx={{
                            color: '#888',
                            borderColor: '#ddd',
                            borderRadius: '8px',
                            px: 3,
                            '&:hover': {
                                borderColor: '#ccc',
                                backgroundColor: 'rgba(0,0,0,0.03)'
                            }
                        }}
                    >
                        {cancelText}
                    </Button>

                    <Button
                        onClick={onLogin}
                        variant="contained"
                        sx={{
                            color: '#fff',
                            backgroundColor: '#FF9080',
                            borderRadius: '8px',
                            px: 3,
                            boxShadow: 'none',
                            '&:hover': {
                                backgroundColor: '#ff8070',
                                boxShadow: '0 2px 6px rgba(255,144,128,0.3)'
                            }
                        }}
                    >
                        {loginText}
                    </Button>
                </DialogActions>
            </Box>
        </Dialog>
    );
};

export default LoginDialog;