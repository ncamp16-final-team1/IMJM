import { Box, Button, Divider, List, ListItemButton, Typography, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from "@mui/material";
import { ChevronRight } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function MyPage() {
  const navigate = useNavigate();
  const [openDialog, setOpenDialog] = useState(false);
  const [point, setPoint] = useState<number | null>(null);

  const menuItems = [
    { label: "My Profile", path: "/my/profile" },
    {
      label: "Point",
      path: "/my/point",
      right: point !== null ? `${point.toLocaleString()} P` : "Loading...",
    },
    { label: "Appointment history", path: "/myPage/appointments" },
    { label: "My Review", path: "/myPage/reviews" },
    { label: "My Acahive", path: "/myPage/acahive" },
    { label: "My Community", path: "/myPage/community" },
    { label: "Announcement", path: "/myPage/announcements" },
    { label: "Logout", path: "/logout", isLogout: true },
  ];

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

  useEffect(() => {
    const fetchPoint = async () => {
      try {
        const res = await fetch("/api/user/my-point", {
          method: "GET",
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          setPoint(data);
        } else {
          console.error("Failed to fetch point");
        }
      } catch (err) {
        console.error("Error fetching point", err);
      }
    };

    fetchPoint();
  }, []);
  
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