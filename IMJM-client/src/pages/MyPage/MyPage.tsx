import { Box, Button, Divider, List, ListItemButton, ListItemText, Typography } from "@mui/material";
import { ChevronRight } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

const menuItems = [
  { label: "My Profile", path: "/profile" },
  { label: "Point", path: "/point", right: "10,000 P" },
  { label: "My Coupons", path: "/coupons" },
  { label: "Appointment history", path: "/appointments" },
  { label: "My Review", path: "/reviews" },
  { label: "My Acahive", path: "/acahive" },
  { label: "My Community", path: "/community" },
  { label: "Announcement", path: "/announcements" },
  { label: "Logout", path: "/logout", isLogout: true },
];

export default function MyPage() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/user/logout", {
        method: "POST",
        credentials: "include", // 쿠키 포함
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

      {/* Delete Account 버튼 */}
      <Box mt={4} textAlign="center">
        <Button variant="text" color="error">Delete Account</Button>
      </Box>
    </Box>
  );
}