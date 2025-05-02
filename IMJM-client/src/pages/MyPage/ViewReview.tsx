import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Stack,
  Divider,
  Button,
  Avatar,
  Paper,
} from "@mui/material";
import axios from "axios";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import ChatIcon from "@mui/icons-material/Chat";
import StarHalfIcon from "@mui/icons-material/StarHalf";

interface ReviewDetail {
  reviewId: number;
  userId: string;
  score: number;
  regDate: string;
  content: string;
  reviewTags: string[];
  reviewPhotoUrls: string[];
  reviewContent: string;
}

interface ReviewReply {
  id: number;
  replyId: number;
  content: string;
  createdAt: string;
}

interface LocationState {
  salonId: string;
  reviewId: number;
  salonName: string;
  salonScore: number;
  reviewCount: number;
  salonAddress: string;
  reservationDate: string;
  reservationTime: string;
  price: number;
  serviceName: string;
  stylistName: string;
  salonPhotoUrl: string;
}

const formatTimeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "방금 전";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}분 전`;
  if (diffInSeconds < 86400)
    return `${Math.floor(diffInSeconds / 3600)}시간 전`;
  if (diffInSeconds < 2592000)
    return `${Math.floor(diffInSeconds / 86400)}일 전`;
  if (diffInSeconds < 31536000)
    return `${Math.floor(diffInSeconds / 2592000)}개월 전`;
  return `${Math.floor(diffInSeconds / 31536000)}년 전`;
};

const formatTime = (timeString: string): string => {
  if (!timeString) return "";
  return timeString.substring(0, 5);
};

const RatingStars = ({ score }: { score: number }) => {
  return (
    <Stack direction="row" alignItems="center" spacing={0.5}>
      {[1, 2, 3, 4, 5].map((star) => {
        if (score >= star) {
          return (
            <StarIcon
              key={`full-${star}`}
              sx={{ color: "#FFD700", fontSize: 30 }}
            />
          );
        } else if (score >= star - 0.5) {
          return (
            <StarHalfIcon
              key={`half-${star}`}
              sx={{ color: "#FFD700", fontSize: 30 }}
            />
          );
        } else {
          return (
            <StarBorderIcon
              key={`empty-${star}`}
              sx={{ color: "#FFD700", fontSize: 30 }}
            />
          );
        }
      })}
    </Stack>
  );
};

export default function ViewReview() {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    salonId,
    reviewId,
    salonName,
    salonScore,
    reviewCount,
    salonAddress,
    reservationDate,
    reservationTime,
    price,
    serviceName,
    stylistName,
    salonPhotoUrl,
  } = (location.state as LocationState) || {};

  const [reviewData, setReviewData] = useState<ReviewDetail | null>(null);
  const [replyData, setReplyData] = useState<ReviewReply | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [replyLoading, setReplyLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [replyError, setReplyError] = useState<string | null>(null);

  useEffect(() => {
    if (!reviewId) return;

    const fetchReview = axios
      .get(`/api/mypages/view-review`, {
        params: { reviewId },
      })
      .then((response) => {
        setReviewData(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("리뷰 데이터를 가져오는 데 실패했습니다:", error);
        setError("리뷰를 불러오는 중 오류가 발생했습니다.");
        setLoading(false);
      });

    const fetchReply = axios
      .get(`/api/mypages/view-review-reply`, {
        params: { reviewId },
      })
      .then((response) => {
        if (response.data) {
          setReplyData(response.data);
        }
        setReplyLoading(false);
      })
      .catch((error) => {
        console.error("답글 데이터를 가져오는 데 실패했습니다:", error);
        setReplyError("답글을 불러오는 중 오류가 발생했습니다.");
        setReplyLoading(false);
      });

    Promise.all([fetchReview, fetchReply]);
  }, [reviewId]);

  // const handleDeleteReview = () => {
  //   const confirmDelete = window.confirm("정말로 이 리뷰를 삭제하시겠습니까?");
  //   if (!confirmDelete || !reviewData) return;

  //   axios
  //     .delete(`/api/mypages/review/${reviewData.reviewId}`)
  //     .then(() => {
  //       alert("리뷰가 성공적으로 삭제되었습니다.");
  //       // navigate('/reviews');
  //     })
  //     .catch((error) => {
  //       console.error("리뷰 삭제 중 오류 발생:", error);
  //       alert("리뷰 삭제에 실패했습니다.");
  //     });
  // };

  // 1. handleEditReview 함수 추가 (기존 함수 사이에 추가)
const handleEditReview = () => {
  if (!reviewData) return;
  
  // Navigate to the WriteOrEditReview component with edit mode
  navigate('/my/review/edit', {
    state: {
      salonId,
      reservationId: reviewData.reviewId, // Use existing reservationId if available
      reviewId: reviewData.reviewId,
      salonName,
      salonScore,
      reviewCount,
      salonAddress,
      reservationDate,
      reservationTime,
      price,
      serviceName,
      stylistName,
      salonPhotoUrl,
      isEdit: true // Flag to indicate edit mode
    }
  });
};

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: "bold" }}>
        View Review Details
      </Typography>

      <Divider sx={{ marginY: 3, borderColor: "grey.500", borderWidth: 2 }} />

      <Box sx={{ display: "flex", mb: 3 }}>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h5" fontWeight="bold">
            {salonName}
          </Typography>

          <Stack
            direction="row"
            alignItems="center"
            spacing={0.5}
            sx={{ mt: 0.5 }}
          >
            <StarIcon sx={{ color: "#FFD700", fontSize: 30 }} />
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ fontSize: 17 }}
            >
              {salonScore || "별점없음"} ({reviewCount || "리뷰없음"})
            </Typography>
          </Stack>

          <Typography variant="body2" sx={{ mt: 0.5 }}>
            {salonAddress}
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 1, mb: 1, fontSize: 17 }}
          >
            {reservationDate} / {formatTime(reservationTime || "")}
          </Typography>

          <Typography variant="body2" color="text.secondary">
            스타일리스트 : {stylistName}
          </Typography>

          <Typography variant="body2" sx={{ mt: 0.5, fontWeight: "bold" }}>
            {price?.toLocaleString()} KRW
          </Typography>
        </Box>

        <Avatar
          variant="rounded"
          src={salonPhotoUrl}
          sx={{ width: "300px", height: "150px", ml: 2 }}
        />
      </Box>

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography
          variant="body1"
          sx={{
            display: "inline-block",
            border: "1px solid",
            borderColor: "#FF9080",
            borderRadius: 4,
            padding: "8px 12px",
            textTransform: "none",
            color: "#FF9080",
            fontWeight: 500,
          }}
        >
          {serviceName}
        </Typography>

        <Button
          variant="outlined"
          size="medium"
          onClick={() => navigate(`/salon/${salonId}`)}
          sx={{
            borderRadius: 4,
            textTransform: "none",
            backgroundColor: "transparent",
            borderColor: "#FF9080",
            color: "#FF9080",
            "&:hover": {
              backgroundColor: "rgba(255, 144, 128, 0.1)",
              borderColor: "#FF9080",
            },
          }}
          startIcon={<ChatIcon fontSize="small" />}
        >
          View Salon
        </Button>
      </Box>

      <Divider sx={{ marginY: 2 }} />

      {loading ? (
        <Typography>리뷰 데이터를 로딩 중입니다...</Typography>
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : reviewData ? (
        <Box>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{ mb: 2 }}
          >
            <Typography variant="h6" sx={{ fontWeight: "bold" }}>
              내가 작성한 리뷰
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ fontSize: 17 }}
            >
              {formatTimeAgo(reviewData.regDate)}
            </Typography>
          </Stack>

          <Box sx={{ mt: 0.5, mb: 1 }}>
            <RatingStars score={reviewData.score} />
          </Box>

          <Box sx={{ maxWidth: 600, margin: "auto" }}>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mt: 2,
                mb: 2,
                lineHeight: 1.5,
                fontSize: 16,
                wordWrap: "break-word",
                wordBreak: "break-word",
                whiteSpace: "pre-wrap",
                overflowWrap: "break-word",
              }}
            >
              {reviewData.reviewContent || reviewData.content}
            </Typography>
          </Box>

          {reviewData.reviewPhotoUrls?.length > 0 && (
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, my: 2 }}>
              {reviewData.reviewPhotoUrls.map((photoUrl, index) => (
                <Avatar
                  key={index}
                  variant="rounded"
                  src={photoUrl}
                  sx={{ width: "120px", height: "120px" }}
                />
              ))}
            </Box>
          )}

          {reviewData.reviewTags?.length > 0 && (
            <Box
              sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 2, mb: 2 }}
            >
              {reviewData.reviewTags.map((tag, index) => (
                <Typography
                  key={index}
                  variant="body2"
                  sx={{
                    border: "1px solid #999",
                    borderRadius: 16,
                    padding: "4px 8px",
                    color: "#999",
                    fontSize: 12,
                  }}
                >
                  #{tag}
                </Typography>
              ))}
            </Box>
          )}

          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 1,
              mt: 2,
            }}
          >
            <Button
    variant="outlined"
    size="small"
    onClick={handleEditReview}
    sx={{
      borderRadius: 2,
      textTransform: "none",
      borderColor: "#FF9080",
      color: "#FF9080",
      "&:hover": {
        borderColor: "#FF9080",
        backgroundColor: "#FF9080",
        color: "#fff",
      },
    }}
  >
    수정
  </Button>

            {/* <Button
              variant="outlined"
              size="small"
              color="error"
              onClick={handleDeleteReview}
              sx={{
                borderRadius: 2,
                textTransform: "none",
                borderColor: "#FF3B30",
                color: "#FF3B30",
                "&:hover": {
                  borderColor: "#FF3B30",
                  backgroundColor: "#FF3B30",
                  color: "#fff",
                },
              }}
            >
              삭제
            </Button> */}
          </Box>
        </Box>
      ) : (
        <Typography>리뷰 정보가 없습니다.</Typography>
      )}

      <Divider sx={{ marginY: 1 }} />

      <Box sx={{ mt: 2, mb: 2 }}>
        <Stack
          direction="row"
          justifyContent="flex-end"
          alignItems="center"
          sx={{ mb: 0 }}
        >
          <Typography variant="h6" sx={{ fontWeight: "bold" }}>
            살롱 리뷰 답변
          </Typography>
        </Stack>

        {replyLoading ? (
          <Typography textAlign="right" color="text.secondary">
            답글을 로딩 중입니다...
          </Typography>
        ) : replyError ? (
          <Typography color="error" textAlign="right">
            {replyError}
          </Typography>
        ) : replyData ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
            }}
          >
            <Typography
              variant="subtitle1"
              fontWeight="bold"
              color="#d32f2f"
              sx={{ mb: 1 }} // 아래 여백 추가
            >
              {stylistName}
            </Typography>
            <Paper
              elevation={0}
              sx={{
                maxWidth: 400,
                p: 2,
                border: "1px solid #ffcdd2",
                borderRadius: 2,
                backgroundColor: "#fff8f8",
              }}
            >
              <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  {formatTimeAgo(replyData.createdAt)}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.primary">
                {replyData.content}
              </Typography>
            </Paper>
          </Box>
        ) : (
          <Typography textAlign="right" color="text.secondary" sx={{ py: 2 }}>
            아직 살롱의 답변이 없습니다.
          </Typography>
        )}
      </Box>

      <Divider sx={{ marginY: 0, borderColor: "grey.500", borderWidth: 2 }} />
    </Box>
  );
}
