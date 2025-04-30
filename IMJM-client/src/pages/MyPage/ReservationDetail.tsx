import { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import axios from "axios";
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Stack,
  Divider,
  Grid,
  Chip,
  Avatar,
} from "@mui/material";
import { formatDate, formatTime } from "../../utils/reservation/dateUtils";
import EventIcon from "@mui/icons-material/Event";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PaymentIcon from "@mui/icons-material/Payment";
import PersonIcon from "@mui/icons-material/Person";

// PaymentInfoDto 인터페이스 정의
interface PaymentInfoDto {
  paymentMethod: string;
  paymentStatus: string;
  paymentDate: string;
  canceledAmount: string | null;
  canceled: boolean;
}

// CouponInfoDto 인터페이스 정의
interface CouponInfoDto {
  couponName: string;
  discountType: string;
  discountValue: number;
  discountAmount: number;
}

// PointUsageDto 인터페이스 정의
interface PointUsageDto {
  points: number;
  useDate: string;
}

// ReservationDetailResponseDto 인터페이스 정의
interface ReservationDetailResponseDto {
  reservationId: number;
  reservationDate: string;
  reservationTime: string;
  serviceName: string;
  serviceType: string;
  price: number;
  requirements: string;
  salonName: string;
  salonAddress: string;
  stylistName: string;
  paymentInfo: PaymentInfoDto | null;
  couponInfo: CouponInfoDto | null;
  pointUsage: PointUsageDto | null;
}

const ReservationDetail = () => {
  const location = useLocation();
  const salonPhotoUrl = location.state?.salonPhotoUrl;
  const { reservationId } = useParams();
  const [reservation, setReservation] =
    useState<ReservationDetailResponseDto | null>(null);

  useEffect(() => {
    const fetchReservation = async () => {
      try {
        console.log("요청할 reservationId:", reservationId);
        const response = await axios.get(
          `/api/mypages/reservations/${reservationId}`
        );
        console.log("응답 받은 데이터:", response.data);
        setReservation(response.data);
      } catch (error) {
        console.error("오류 발생:", error);
      }
    };

    fetchReservation();
  }, [reservationId]);

  if (!reservation) {
    return <div>Loading...</div>;
  }

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: "bold" }}>
        Reservation Details
      </Typography>

      <Divider sx={{ marginY: 3, borderColor: "grey.500", borderWidth: 2 }} />

      <Paper elevation={0}>
        {salonPhotoUrl && (
          <Avatar
            variant="rounded"
            src={salonPhotoUrl}
            sx={{
              width: "100%",
              height: 200,
              mb: 4,
              objectFit: "cover",
            }}
          />
        )}

        <Divider sx={{ mb: 3 }} />

        {/* 예약 기본 정보 */}
        <Grid container spacing={10} justifyContent="" sx={{ mb: 3 }}>
          <Grid item xs={12} sm={5} ml={0}>
            <Stack
              direction="row"
              alignItems="center"
              spacing={1}
              sx={{ mb: 1 }}
            >
              <EventIcon sx={{ color: "#FF9080" }} />
              <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                예약 날짜 및 시간
              </Typography>
            </Stack>
            <Typography variant="body1" sx={{ ml: 4 }}>
              {reservation.reservationDate} / {reservation.reservationTime}
            </Typography>
          </Grid>

          <Grid item xs={12} sm={5}>
            <Stack
              direction="row"
              alignItems="center"
              spacing={1}
              sx={{ mb: 1 }}
            >
              <PersonIcon sx={{ color: "#FF9080" }} />
              <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                서비스 및 스타일리스트
              </Typography>
            </Stack>
            <Typography variant="body1" sx={{ ml: 4.5 }}>
              {reservation.serviceName} - {reservation.stylistName}
            </Typography>
          </Grid>
        </Grid>

        {/* 매장 주소 */}
        <Box sx={{ mb: 3 }}>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
            <LocationOnIcon sx={{ color: "#FF9080" }} />
            <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
              매장 주소
            </Typography>
          </Stack>
          <Typography variant="body1" sx={{ ml: 4 }}>
            {reservation.salonName}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ ml: 4 }}>
            {reservation.salonAddress}
          </Typography>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* 결제 정보 */}
        <Box sx={{ mb: 3 }}>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
            <PaymentIcon sx={{ color: "#FF9080" }} />
            <Typography variant="subtitle1">결제 정보</Typography>
          </Stack>

          <Grid container spacing={2} sx={{ ml: 4 }}>
            <Grid item xs={6}>
              <Typography variant="body2">결제 금액:</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body1" fontWeight="bold">
                {reservation.price.toLocaleString()} 원
              </Typography>
            </Grid>

            <Grid item xs={6}>
              <Typography variant="body2">결제 방법:</Typography>
            </Grid>
            <Grid item xs={6}>
              <Chip
                label={
                  reservation.paymentInfo?.paymentMethod || "결제 정보 없음"
                }
                color="primary"
                size="small"
                variant="outlined"
              />
            </Grid>

            <Grid item xs={6}>
              <Typography variant="body2">결제 상태:</Typography>
            </Grid>
            <Grid item xs={6}>
              <Chip
                label={reservation.paymentInfo?.paymentStatus || "미확인"}
                color={
                  reservation.paymentInfo?.paymentStatus ? "success" : "error"
                }
                size="small"
              />
            </Grid>
          </Grid>
        </Box>

        {/* 추가 요구사항 */}
        {reservation.requirements && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: "bold" }}>
              추가 요구사항
            </Typography>
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                backgroundColor: "grey.50",
                minHeight: 120, // 원하는 높이(px)
              }}
            >
              <Typography variant="body2">
                {reservation.requirements}
              </Typography>
            </Paper>
          </Box>
        )}
      </Paper>
      <Divider sx={{ marginY: 3, borderColor: "grey.500", borderWidth: 2 }} />
    </Box>
  );
};

export default ReservationDetail;
