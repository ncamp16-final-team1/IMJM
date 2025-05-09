import { Box, Button, Divider, List, ListItemButton, Typography, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from "@mui/material";
import { ChevronRight } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function MyPageKR() {
    const navigate = useNavigate();
    const [openDialog, setOpenDialog] = useState(false);
    const [point, setPoint] = useState<number | null>(null);

    const menuItems = [
        { label: "내 프로필", path: "/my/profile" },
        {
            label: "포인트",
            path: "/my/point",
            right: point !== null ? `${point.toLocaleString()} P` : "로딩 중...",
        },
        { label: "예약 내역", path: "/my/appointments" },
        { label: "내 아카이브", path: "/my/acahive" },
        { label: "공지사항", path: "/my/announcements" },
        { label: "로그아웃", path: "/logout", isLogout: true },
    ];

    const handleLogout = async () => {
        try {
            const response = await fetch("/api/user/logout", {
                method: "POST",
                credentials: "include",
            });

            if (response.ok) {
                window.location.href = "/";
            } else {
                alert("로그아웃에 실패했습니다. 다시 시도해주세요.");
            }
        } catch (error) {
            console.error("로그아웃 오류:", error);
            alert("로그아웃 중 오류가 발생했습니다.");
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
                window.location.href = '/';
            } else {
                alert("계정 삭제에 실패했습니다. 다시 시도해주세요.");
            }
        } catch (error) {
            console.error("계정 삭제 오류:", error);
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
                    console.error("포인트 정보를 가져오는데 실패했습니다");
                }
            } catch (err) {
                console.error("포인트 정보 가져오기 오류", err);
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
                    회원 탈퇴
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