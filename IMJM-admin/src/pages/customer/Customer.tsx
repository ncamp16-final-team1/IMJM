import React, { useEffect, useState } from "react";
import {
    Box,
    Typography,
    TextField,
    Button,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    InputAdornment
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import axios from "axios";
import BlacklistModal from "./BlacklistModal";

interface ReservationCustomerDto {
    userId: string;
    userName: string;
    serviceName: string;
    reservationDate: string;
    visitCount: number;
    requirements: string;
}

interface BlacklistDto {
    userId: string;
    userName: string;
    reason: string;
    blockedDate: string;
}

const Customer = () => {
    const [customers, setCustomers] = useState<ReservationCustomerDto[]>([]);
    const [selectedCustomer, setSelectedCustomer] = useState<ReservationCustomerDto | null>(null);
    const [blacklist, setBlacklist] = useState<BlacklistDto[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [blacklistModalOpen, setBlacklistModalOpen] = useState(false);

    const isBlacklisted = selectedCustomer && blacklist.some(b => b.userId === selectedCustomer.userId);

    useEffect(() => {
        axios.get("/api/admin/customer")
            .then(res => {
                const sorted = [...res.data].sort((a: ReservationCustomerDto, b: ReservationCustomerDto) =>
                    new Date(b.reservationDate).getTime() - new Date(a.reservationDate).getTime()
                );
                setCustomers(sorted);
            })
            .catch(err => {
                console.error("고객 목록 불러오기 실패:", err);
            });

        axios.get("/api/admin/customer/black")
            .then(res => setBlacklist(res.data))
            .catch(err => {
                console.error("블랙리스트 목록 불러오기 실패:", err);
            });
    }, []);

    const handleBlacklistToggle = async () => {
        if (!selectedCustomer) return;
        if (isBlacklisted) {
            try {
                await axios.delete(`/api/admin/customer/black/${selectedCustomer.userId}`);
                setBlacklist(prev => prev.filter(b => b.userId !== selectedCustomer.userId));
            } catch (error) {
                console.error("블랙리스트 제거 실패:", error);
            }
        } else {
            setBlacklistModalOpen(true);
        }
    };

    const handleBlacklistSubmit = async (reason: string) => {
        if (!selectedCustomer) return;

        try {
            await axios.post(`/api/admin/customer/black/${selectedCustomer.userId}`, { reason });
            setBlacklist(prev => [
                ...prev,
                {
                    userId: selectedCustomer.userId,
                    userName: selectedCustomer.userName,
                    reason
                }
            ]);
        } catch (error) {
            console.error("블랙리스트 등록 실패:", error);
        }
    };

    const filteredCustomers = customers.filter(c =>
        c.userName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Box display="flex" gap={4} p={4}>
            {/* 고객 리스트 */}
            <Box>
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>고객 검색</Typography>
                <Box width="400px" height="680px" border="2px solid #ffa394" borderRadius={2} p={2}>
                    <TextField
                        placeholder="고객 이름 검색"
                        fullWidth
                        variant="standard"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <SearchIcon />
                                </InputAdornment>
                            )
                        }}
                    />
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell><b>Name</b></TableCell>
                                <TableCell><b>Date</b></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredCustomers.map(c => (
                                <TableRow key={`${c.userId}-${c.reservationDate}`} hover onClick={() => setSelectedCustomer(c)} style={{ cursor: "pointer" }}>
                                    <TableCell>{c.userName} ({c.nickName})</TableCell>
                                    <TableCell>{c.reservationDate}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Box>
            </Box>
            <Box flex="0 0 480px" display="flex" flexDirection="column" gap={4}>
                {/* 사용자 정보 */}
                <Box>
                    <Typography variant="h6" fontWeight="bold">상세 정보</Typography>
                    <Box mt={2} border="2px solid #ffa394" height="250px" borderRadius={2}>
                        <Table sx={{ height: "100%" }}>
                            <TableBody>
                                <TableRow>
                                    <TableCell sx={{ width: 100 }}><b>이름</b></TableCell>
                                    <TableCell>{selectedCustomer?.userName ?? "-"} ({selectedCustomer?.nickName ?? "-"})</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell sx={{ width: 100 }}><b>디자인</b></TableCell>
                                    <TableCell>{selectedCustomer?.serviceName ?? "-"}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell sx={{ width: 100 }}><b>방문일</b></TableCell>
                                    <TableCell>{selectedCustomer ? `${selectedCustomer.reservationDate} / ${selectedCustomer.visitCount}회` : "-"}</TableCell>
                                </TableRow>
                                <TableRow sx={{ height: "100%" }}>
                                    <TableCell sx={{ width: 100, verticalAlign: "top" }}><b>요구사항</b></TableCell>
                                    <TableCell sx={{}}>
                                        <Box
                                            sx={{
                                                height: "60px",
                                                overflowY: "auto",
                                                whiteSpace: "pre-wrap"
                                            }}
                                        >
                                            {selectedCustomer?.requirements || "-"}
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </Box>
                    {selectedCustomer && (
                        <Button variant="outlined" color="error" onClick={handleBlacklistToggle} sx={{ mt: 2 }}>
                            블랙 리스트 {isBlacklisted ? "제거" : "추가"}
                        </Button>
                    )}
                </Box>

                {/* 블랙리스트 */}
                <Box>
                    <Typography variant="h6" fontWeight="bold">블랙 리스트</Typography>
                    <Box mt={2} border="2px solid #ffa394" borderRadius={2} height="326px" >
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell><b>이름</b></TableCell>
                                    <TableCell><b>사유</b></TableCell>
                                    <TableCell><b>Date</b></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {blacklist.map(item => {
                                    const lastDate = customers.find(c => c.userId === item.userId)?.reservationDate ?? "-";
                                    return (
                                        <TableRow key={`black-${item.userId}`}>
                                            <TableCell>{item.userName} ({item.nickName})</TableCell>
                                            <TableCell>{item.reason}</TableCell>
                                            <TableCell>{lastDate}</TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </Box>
                </Box>
            </Box>
            <BlacklistModal
                open={blacklistModalOpen}
                onClose={() => setBlacklistModalOpen(false)}
                onSubmit={handleBlacklistSubmit}
            />
        </Box>
    );
};

export default Customer;