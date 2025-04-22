import React, { useState } from "react";
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  Button,
  IconButton
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

interface Props {
  open: boolean;
  onClose: () => void;
  onSubmit: (reason: string) => void;
}

const BlacklistModal = ({ open, onClose, onSubmit }: Props) => {
  const [reason, setReason] = useState("");

  const handleRegister = () => {
    if (reason.trim()) {
      onSubmit(reason.trim());
      setReason("");
      onClose();
    }
  };

  const handleClose = () => {
    setReason("");
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography fontWeight="bold">블랙 리스트 사유</Typography>
          <IconButton size="small" onClick={handleClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Typography gutterBottom>내용</Typography>
        <TextField
          fullWidth
          multiline
          minRows={4}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          sx={{ mt: 1 }}
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button
          variant="contained"
          onClick={handleRegister}
          sx={{
            backgroundColor: "#FF9080",
            color: "white",
            boxShadow: "none",
            "&:hover": { backgroundColor: "#f78777", boxShadow: "none" }
          }}
        >
          등록 하기
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BlacklistModal;