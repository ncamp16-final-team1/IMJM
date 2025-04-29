import React, { useState, useEffect } from "react";
import axios from "axios";
import {
    Grid,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    TextField,
    Button,
    Typography,
    Card,
    CardContent,
    Avatar,
    Box,
} from "@mui/material";
import StarIcon from "@mui/icons-material/Star";

function Review() {
    const [reviews, setReviews] = useState<any[]>([]);
    const [selectedReview, setSelectedReview] = useState<any>(null);
    const [answer, setAnswer] = useState("");

    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        try {
            const response = await axios.get("/api/admin/review/list", {
                withCredentials: true,
            });
            setReviews(response.data);
        } catch (error) {
            console.error("리뷰 목록 불러오기 실패:", error);
        }
    };

    const handleReviewSelect = async (review: any) => {
        setSelectedReview(null);
        try {
            const response = await axios.get(`/api/admin/review/${review.reviewId}`);
            const reviewDetail = response.data;

            setSelectedReview(reviewDetail);
            setAnswer(reviewDetail.reviewReply || "");
        } catch (error) {
            console.error("리뷰 상세 정보 불러오기 실패:", error);
        }
    };

    const handleAnswerChange = (e: any) => {
        setAnswer(e.target.value);
    };

    const handleSubmitAnswer = async () => {
        if (!selectedReview) return;

        try {
            await axios.post("/api/admin/review/reply", {
                reviewId: selectedReview.id,
                content: answer,
            });
            alert("답변이 제출되었습니다!");

            const res = await axios.get("/api/admin/review/list");
            setReviews(res.data);
            
            const response = await axios.get(`/api/admin/review/${selectedReview.id}`);
            setSelectedReview(response.data);
        } catch (error) {
            console.error("답변 제출 실패:", error);
            alert("답변 제출에 실패했습니다.");
        }
    };

    const handleUpdateAnswer = async () => {
        if (!selectedReview || !selectedReview.id) return;
    
        try {
            await axios.put("/api/admin/review/reply", {
                reviewId: selectedReview.id,
                content: answer,
            });
            alert("답변이 수정되었습니다!");
    
            const res = await axios.get("/api/admin/review/list");
            setReviews(res.data);
            
            const response = await axios.get(`/api/admin/review/${selectedReview.id}`);
            setSelectedReview(response.data);
        } catch (error) {
            console.error("답변 수정 실패:", error);
            alert("답변 수정에 실패했습니다.");
        }
    };
    
    const handleDeleteAnswer = async () => {
        if (!selectedReview || !selectedReview.id) return;
    
        try {
            await axios.delete(`/api/admin/review/reply/${selectedReview.id}`);
            alert("답변이 삭제되었습니다!");
            setAnswer("");
    
            const res = await axios.get("/api/admin/review/list");
            setReviews(res.data);
            
            const response = await axios.get(`/api/admin/review/${selectedReview.id}`);
            setSelectedReview(response.data);
        } catch (error) {
            console.error("답변 삭제 실패:", error);
            alert("답변 삭제에 실패했습니다.");
        }
    };

    return (
        <Box sx={{ padding: 3 }}>
            <Typography variant="h5" fontWeight="bold" mb={3}>
                리뷰 관리
            </Typography>

            <Grid container spacing={2}>
                {/* 왼쪽: 리뷰 목록 */}
                <Grid item>
                    <Card
                        sx={{
                            width: 430,
                            height: 700,
                            borderRadius: 2,
                            border: "2px solid #FF9080",
                            boxShadow: "none",
                        }}
                    >
                        <CardContent>
                            <Typography variant="h6" align="center" mb={2}>
                                리뷰 목록
                            </Typography>
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell align="center">번호</TableCell>
                                        <TableCell align="center">작성자(고객명)</TableCell>
                                        <TableCell align="center">작성 날짜</TableCell>
                                        <TableCell align="center">답변 여부</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {reviews.map((review, idx) => (
                                        <TableRow
                                            key={review.reviewId}
                                            hover
                                            onClick={() => handleReviewSelect(review)}
                                            sx={{ cursor: "pointer" }}
                                        >
                                            <TableCell align="center">{idx + 1}</TableCell>
                                            <TableCell align="center">{review.userName}</TableCell>
                                            <TableCell align="center">
                                                {new Date(review.regDate).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell align="center">
                                                {review.answered ? "✔️" : "—"}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </Grid>

                {/* 오른쪽: 리뷰 상세 및 답변 작성 */}
                <Grid item>
                    <Grid container direction="column" spacing={2}>
                        {/* 리뷰 상세 */}
                        <Grid item>
                            <Card
                                sx={{
                                    width: 450,
                                    height: 400,
                                    borderRadius: 2,
                                    border: "2px solid #FF9080",
                                    boxShadow: "none",
                                }}
                            >
                                <CardContent>
                                    <Typography variant="h6" mb={2} align="center">
                                        고객 리뷰
                                    </Typography>

                                    {selectedReview ? (
                                        <>
                                            {/* 사용자 이름 */}
                                            <Typography variant="subtitle1" fontWeight="bold">
                                                {selectedReview.userName}
                                            </Typography>

                                            {/* 별점 */}
                                            <Box display="flex" alignItems="center" mt={1} mb={1}>
                                                {[...Array(selectedReview.score)].map((_, i) => (
                                                    <StarIcon key={i} fontSize="small" sx={{ color: "#FFD700" }} />
                                                ))}
                                            </Box>

                                            {/* 예약 정보 */}
                                            <Typography variant="body2" color="textSecondary" mb={1}>
                                                {selectedReview.stylistName} | {new Date(selectedReview.visitDate).toLocaleDateString()} {selectedReview.visitTime.substring(0,5)} | {selectedReview.serviceName}
                                            </Typography>

                                            {/* 리뷰 내용 */}
                                            <TextField
                                                fullWidth
                                                value={selectedReview.content}
                                                multiline
                                                InputProps={{
                                                    readOnly: true,
                                                }}
                                                variant="outlined"
                                                size="small"
                                                sx={{ mb: 2 }}
                                            />

                                            {/* 사진들 */}
                                            <Box display="flex" alignItems="center" mb={2}>
                                                {selectedReview?.photoUrls?.length > 0 ? (
                                                    selectedReview.photoUrls.map((url, idx) => (
                                                        <Box
                                                        key={idx}
                                                        component="img"
                                                        src={url}
                                                        sx={{
                                                          width: 70,
                                                          height: 70,
                                                          mr: 2,
                                                          borderRadius: 2, 
                                                          objectFit: "cover",
                                                        }}
                                                      />
                                                    ))
                                                ) : (
                                                    <Typography>사진이 없습니다.</Typography>
                                                )}
                                            </Box>

                                            {/* 태그들 */}
                                            <Box>
                                                {selectedReview.reviewTag.split(',').map((tag, idx) => (
                                                    <Box
                                                        key={idx}
                                                        sx={{
                                                            backgroundColor: "#f5f5f5",
                                                            color: "#666",
                                                            borderRadius: "20px",
                                                            px: 0.8,
                                                            py: 0.4,
                                                            display: "inline-block",
                                                            marginRight: 1,
                                                            marginBottom: 1,
                                                            fontSize: "12px",
                                                        }}
                                                    >
                                                        #{tag.trim()} {/* trim()을 사용하여 앞뒤 공백 제거 */}
                                                    </Box>
                                                ))}
                                            </Box>
                                        </>
                                    ) : (
                                        <Typography align="center">리뷰를 선택하세요.</Typography>
                                    )}
                                </CardContent>
                            </Card>
                        </Grid>


                        {/* 답변 작성/수정/삭제 */}
                        {selectedReview && (
                            <Grid item>
                                <Card
                                    sx={{
                                        width: 450,
                                        height: 280,
                                        borderRadius: 2,
                                        border: "2px solid #FF9080",
                                        boxShadow: "none",
                                    }}
                                >
                                    <CardContent>
                                        <Typography variant="h6" mb={2} align="center">
                                            {selectedReview.reviewReply ? "답변 수정/삭제" : "답변 작성"}
                                        </Typography>
                                        <TextField
                                            fullWidth
                                            placeholder="내용을 입력해주세요."
                                            multiline
                                            rows={4}
                                            value={answer}
                                            onChange={handleAnswerChange}
                                        />
                                        <Box display="flex" justifyContent="flex-end" mt={2}>
                                            {selectedReview.reviewReply ? (
                                                // 답변 수정/삭제 버튼
                                                <>
                                                    <Button
                                                        variant="contained"
                                                        onClick={handleUpdateAnswer}
                                                        disabled={!answer}
                                                        sx={{
                                                            bgcolor: "#FF9080",
                                                            color: "#fff",
                                                            boxShadow: "none",
                                                            borderRadius: 50,
                                                            "&:hover": {
                                                                bgcolor: "#FF7563",
                                                                boxShadow: "none",
                                                            },
                                                            mr: 1,
                                                        }}
                                                    >
                                                        수정
                                                    </Button>
                                                    <Button
                                                        variant="contained"
                                                        onClick={handleDeleteAnswer}
                                                        sx={{
                                                            bgcolor: "#FF7563",
                                                            color: "#fff",
                                                            boxShadow: "none",
                                                            borderRadius: 50,
                                                            "&:hover": {
                                                                bgcolor: "#FF5A3F",
                                                                boxShadow: "none",
                                                            },
                                                        }}
                                                    >
                                                        삭제
                                                    </Button>
                                                </>
                                            ) : (
                                                // 답변 등록 버튼
                                                <Button
                                                    variant="contained"
                                                    onClick={handleSubmitAnswer}
                                                    disabled={!answer}
                                                    sx={{
                                                        bgcolor: "#FF9080",
                                                        color: "#fff",
                                                        boxShadow: "none",
                                                        borderRadius: 50,
                                                        "&:hover": {
                                                            bgcolor: "#FF7563",
                                                            boxShadow: "none",
                                                        },
                                                    }}
                                                >
                                                    등록
                                                </Button>
                                            )}
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                        )}
                    </Grid>
                </Grid>
            </Grid>
        </Box>
    );
}

export default Review;
