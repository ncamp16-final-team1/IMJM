import { Box, Button, Divider, List, ListItemButton, Typography, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from "@mui/material";
import { ChevronRight } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useState } from "react";


const menuItems = [
  { label: "My Profile", path: "/profile" },
  { label: "Point", path: "/point", right: "10,000 P" },
  { label: "Appointment history", path: "/appointments" },
  { label: "My Review", path: "/reviews" },
  { label: "My Acahive", path: "/acahive" },
  { label: "My Community", path: "/community" },
  { label: "Announcement", path: "/announcements" },
  { label: "Logout", path: "/logout", isLogout: true },
];

export default function MyPage() {
  const navigate = useNavigate();
  const [openDialog, setOpenDialog] = useState(false);

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/user/logout", {
        method: "POST",
        credentials: "include",
      });

      if (response.ok) {
        navigate("/");
      } else {
        alert("Logout failed. Please try again.");
      }
    } catch (error) {
      console.error("Logout error:", error);
      alert("An error occurred while logging out.");
    }
  };

  const handleDeleteAccount = async () => {
    try {
      const response = await fetch("/api/user/delete-account", {
        method: "DELETE",
        credentials: "include",
      });

      if (response.ok) {
        await fetch("/api/user/logout", {
          method: "POST",
          credentials: "include",
        });
        navigate("/");
      } else {
        alert("Delete account failed. Please try again.");
      }
    } catch (error) {
      console.error("Delete account error:", error);
    }
  };

  return (
    <Box p={2} pt={4}>
      <List>
        {menuItems.map(({ label, path, right, isLogout }) => (
          <div key={label}>
            <ListItemButton
              onClick={() => {
                if (isLogout) {
                  handleLogout();
                } else {
                  navigate(path);
                }
              }}
              sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
            >
              <Box>
                <Typography>{label}</Typography>
              </Box>

              <Box display="flex" alignItems="center">
                {right && (
                  <Typography variant="body2" color="text.secondary" sx={{ marginRight: 1 }}>
                    {right}
                  </Typography>
                )}
                <ChevronRight fontSize="small" />
              </Box>
            </ListItemButton>
            <Divider />
          </div>
        ))}
      </List>

      <Box mt={4} textAlign="center">
        <Button variant="text" color="error" onClick={() => setOpenDialog(true)}>
          Delete Account
        </Button>
      </Box>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>회원 탈퇴</DialogTitle>
        <DialogContent>
          <DialogContentText>
            정말로 회원 탈퇴하시겠습니까? 이 작업은 되돌릴 수 없습니다.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>취소</Button>
          <Button onClick={handleDeleteAccount} color="error">확인</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}