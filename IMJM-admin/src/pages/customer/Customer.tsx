import React, { useState } from "react";
import { Box, Typography, TextField, Button, List, ListItem, ListItemText, MenuItem, Select } from "@mui/material";

interface Customers {
  id: number;
  name: string;
  phone: string;
  design: string;
  visitDate: string;
  request: string;
}

const dummyCustomers: Customers[] = [
  { id: 1, name: "신동엽", phone: "010-1111-1111", design: "[커트] 남성 커트", visitDate: "2025.01.01 /2회", request: "Please cut it nicely" },
  { id: 2, name: "James", phone: "010-2222-2222", design: "[염색] 브라운", visitDate: "2025.02.15 /1회", request: "" },
  { id: 3, name: "James Walker", phone: "010-3333-3333", design: "[펌] 아이롱펌", visitDate: "2025.03.10 /3회", request: "No sideburns" },
];

const Customer = () => {
  const [selectedCustomer, setSelectedCustomer] = useState<Customers | null>(null);
  const [blacklist, setBlacklist] = useState<Customers[]>([]);

  const handleBlacklistToggle = () => {
    if (!selectedCustomer) return;
    const isBlacklisted = blacklist.find(c => c.id === selectedCustomer.id);
    if (isBlacklisted) {
      setBlacklist(blacklist.filter(c => c.id !== selectedCustomer.id));
    } else {
      setBlacklist([...blacklist, selectedCustomer]);
    }
  };

  return (
    <Box display="flex" gap={4} p={4}>
      {/* 고객 리스트 */}
      <Box minWidth="250px" border="1px solid #ffa394" p={2} borderRadius={2}>
        <Typography variant="h6" fontWeight="bold">고객 이름 검색</Typography>
        <TextField fullWidth variant="standard" placeholder="이름 검색" sx={{ mt: 2 }} />
        <List>
          {dummyCustomers.map(customer => (
            <ListItem button key={customer.id} onClick={() => setSelectedCustomer(customer)}>
              <ListItemText primary={customer.name} />
            </ListItem>
          ))}
        </List>
      </Box>

      {/* 사용자 정보 */}
      <Box flex={1} border="2px solid #ffa394" borderRadius={2} p={2}>
        <Typography variant="h6" fontWeight="bold">사용자 정보</Typography>
        {selectedCustomer ? (
          <Box mt={2}>
            <Typography><strong>이름:</strong> {selectedCustomer.name}</Typography>
            <Typography><strong>연락처:</strong> {selectedCustomer.phone}</Typography>
            <Typography><strong>디자인:</strong> {selectedCustomer.design}</Typography>
            <Typography><strong>방문일:</strong> {selectedCustomer.visitDate}</Typography>
            <Typography><strong>요구사항:</strong> {selectedCustomer.request}</Typography>
            <Button variant="outlined" color="error" sx={{ mt: 2 }} onClick={handleBlacklistToggle}>
              블랙 리스트 {blacklist.some(c => c.id === selectedCustomer.id) ? "제거" : "추가"}
            </Button>
          </Box>
        ) : (
          <Typography mt={2}>고객을 선택하세요.</Typography>
        )}
      </Box>

      {/* 블랙 리스트 */}
      <Box minWidth="250px" border="1px solid #ffa394" p={2} borderRadius={2}>
        <Typography variant="h6" fontWeight="bold">블랙 리스트</Typography>
        <List>
          {blacklist.map(c => (
            <ListItem key={c.id}>
              <ListItemText primary={c.name} />
            </ListItem>
          ))}
        </List>
      </Box>
    </Box>
  );
};

export default Customer;