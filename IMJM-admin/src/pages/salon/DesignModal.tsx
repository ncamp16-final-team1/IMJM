import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Table, TableHead, TableRow, TableCell, TableBody,
    IconButton, Button, TextField
} from "@mui/material";
import { Add, Delete } from "@mui/icons-material";
import CloseIcon from "@mui/icons-material/Close";
import { useEffect, useState } from "react";

const DesignModal = ({ open, onClose, data, onSave }) => {
    const [rows, setRows] = useState(data);

    useEffect(() => {
        if (open) {
            setRows(data);
        }
    }, [data, open]);

    const handleChange = (index, key, value) => {
        const updated = [...rows];
        updated[index][key] = value;
        setRows(updated);
    };

    const handleDelete = (index) => {
        const updated = [...rows];
        updated.splice(index, 1);
        setRows(updated);
    };

    const handleAddRow = () => {
        setRows([
            ...rows,
            { id: null, serviceType: "", serviceName: "", serviceDescription: "", price: 0 },
        ]);
    };

    const handleSave = () => {
        const isValid = rows.every(row =>
            row.serviceType && row.serviceName && row.serviceDescription && row.price >= 0
        );
        if (!isValid) {
            alert("모든 필드를 채워주세요.");
            return;
        }
        onSave(rows);
        onClose();
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth={false} PaperProps={{ sx: { width: 1000, height: 700 } }}>
            <DialogTitle display="flex" justifyContent="space-between" mb={2}>
                디자인 상세보기
                <IconButton onClick={onClose}><CloseIcon /></IconButton>
            </DialogTitle>
            <DialogContent sx={{ overflow: "auto", maxHeight: 700 }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ width: 150 }}>종류</TableCell>
                            <TableCell sx={{ width: 150 }}>디자인</TableCell>
                            <TableCell sx={{ width: 300 }}>설명</TableCell>
                            <TableCell sx={{ width: 120 }}>가격</TableCell>
                            <TableCell sx={{ width: 80 }} align="center">삭제</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {rows.map((row, index) => (
                            <TableRow key={index}>
                                <TableCell>
                                    <TextField
                                        variant="standard"
                                        value={row.serviceType}
                                        onChange={(e) => handleChange(index, "serviceType", e.target.value)}
                                    />
                                </TableCell>
                                <TableCell>
                                    <TextField
                                        variant="standard"
                                        value={row.serviceName}
                                        onChange={(e) => handleChange(index, "serviceName", e.target.value)}
                                    />
                                </TableCell>
                                <TableCell>
                                    <TextField
                                        variant="standard"
                                        value={row.serviceDescription}
                                        sx={{ width: 300 }}
                                        onChange={(e) => handleChange(index, "serviceDescription", e.target.value)}
                                    />
                                </TableCell>
                                <TableCell>
                                    <TextField
                                        variant="standard"
                                        type="number"
                                        value={row.price}
                                        onChange={(e) => handleChange(index, "price", parseInt(e.target.value) || 0)}
                                    />
                                </TableCell>
                                <TableCell align="center">
                                    <IconButton color="error" onClick={() => handleDelete(index)}>
                                        <Delete />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                        <TableRow>
                            <TableCell colSpan={5} align="center">
                                <IconButton onClick={handleAddRow}>
                                    <Add />
                                </IconButton>
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleSave} variant="contained" sx={{
                    bgcolor: "#FF9080", color: "#fff", "&:hover": { bgcolor: "#FF7563" }, m: 1
                }}>
                    저장
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default DesignModal;