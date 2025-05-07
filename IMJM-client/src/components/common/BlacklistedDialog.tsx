import { Dialog, DialogContent, DialogActions, Button, Typography, Box, IconButton, Paper } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { useNavigate } from 'react-router-dom';

interface Props {
  open: boolean;
  onClose: () => void;
  message?: string;
  redirectUrl?: string; 
  redirectLabel?: string; 
}

const BlacklistedDialog = ({ 
  open, 
  onClose, 
  message = "현재 매장은 예약이 불가능합니다.",
  redirectUrl = "/salon", 
  redirectLabel = "살롱 목록으로"
}: Props) => {
  const navigate = useNavigate();

  const handleRedirect = () => {
    onClose();
    navigate(redirectUrl);
  };

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
            예약 불가
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
          {redirectUrl && (
            <Button
              onClick={handleRedirect}
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
              {redirectLabel}
            </Button>
          )}
        </DialogActions>
      </Box>
    </Dialog>
  );
};

export default BlacklistedDialog;