import React from 'react';
import {
    Dialog, DialogTitle, DialogActions, Button
} from '@mui/material';

interface ConfirmDialogProps {
    open: boolean;
    title?: string;
    onClose: () => void;
    onConfirm: () => void;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({ open, title = '정말 삭제하시겠습니까?', onClose, onConfirm }) => {
    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle sx={{ px: 4, pt: 3, fontWeight: 'bold' }}>{title}</DialogTitle>
            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button onClick={onClose} sx={{ fontWeight: 'bold' }}>취소</Button>
                <Button
                    onClick={onConfirm}
                    variant="contained"
                    color="error"
                    sx={{ fontWeight: 'bold' }}
                >
                    삭제
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ConfirmDialog;