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
      <Dialog 
        open={open} 
        onClose={onClose}
        PaperProps={{
          sx: {
            border: '6px solid #FDC7BF', 
            borderRadius: 2,                
            overflow: 'hidden'
          }
        }}
      >
        <DialogTitle
          sx={{
            borderBottom: '4px solid #FDC7BF', 
            px: 3,
            py: 2,
            fontWeight: 'bold',
            fontSize: '1.2rem',
            textAlign: 'center',
            backgroundColor: '#FFF8F6', 
            mb: 2,
          }}
        >
          {title}
        </DialogTitle>

        <DialogContent
          sx={{
            px: 6,
            pb: 2,
            pt: 5,
            textAlign: 'center'
          }}
        >
          <Typography variant="body1">{message}</Typography>
        </DialogContent>

        <DialogActions
          sx={{
            px: 3,
            pb: 2,
            justifyContent: 'center',
            gap: 2
          }}
        >
          <Button 
            onClick={onClose} 
            variant="outlined"
            sx={{ 
              color: '#F06292',
              borderColor: '#FDC7BF',          
              '&:hover': {
                borderColor: '#fbc0b3',
                backgroundColor: '#fff7f5'
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