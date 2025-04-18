import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
} from '@mui/material';

interface LoginDialogProps {
  open: boolean;
  onClose: () => void;
  onLogin: () => void;
  title?: string;
  message?: string;
  cancelText?: string;
  loginText?: string;
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
      <Dialog open={open} onClose={onClose} >
        <DialogTitle
                  sx={{
                    border: '6px solid #FDC7BF'
                }}
        >{title}</DialogTitle>
        <DialogContent>
        <Typography>{message}</Typography>
        </DialogContent>
        <DialogActions>
        <Button 
                onClick={onClose} 
                sx={{ 
                color: '#FDC7BF' 
                }}>
            {cancelText}
        </Button>
        <Button
            onClick={onLogin} 
            variant="contained"
            sx={{ 
                color: '#F06292',
                backgroundColor: '#FDC7BF',
                '&:hover': {
                backgroundColor: '#fbc0b3' 
                }
            }}
            >
            {loginText}
        </Button>
        </DialogActions>
      </Dialog>
    );
  };

export default LoginDialog;