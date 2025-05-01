import { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import axios from "axios";
import {
  Box,
  Typography,
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

interface PaymentInfoDto {
  paymentMethod: string;
  paymentStatus: string;
  paymentDate: string;
  canceledAmount: string | null;
  price: number;
  canceled: boolean;
}

interface CouponInfoDto {
  couponName: string;
  discountType: string;
  discountValue: number;
  discountAmount: number;
}

interface PointUsageDto {
  points: number;
  useDate: string;
}

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
        const response = await axios.get(
          `/api/mypages/reservations/${reservationId}`
        );
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
      <Typography variant="h5" sx={{ ml: 4, fontWeight: "bold" }}>
          {reservation.salonName}
        </Typography>
        
        <Divider sx={{ mb: 3, mt:3 }} />
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
        
        <Box sx = {{ px:3 }}>
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
                {reservation.reservationDate} / {formatTime(reservation.reservationTime)}
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

          <Box sx={{ mb: 3 }}>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
              <LocationOnIcon sx={{ color: "#FF9080" }} />
              <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                매장 주소
              </Typography>
            </Stack>
            <Typography variant="body2" color="text.secondary" sx={{ ml: 4 }}>
              {reservation.salonAddress}
            </Typography>
          </Box>

          <Divider sx={{ mb: 3 }} />

          <Box>
            <Stack 
              direction="row" 
              alignItems="center" 
              sx={{ mb: 1 }}
            >
              <Stack direction="row" alignItems="center" spacing={1}>
                <PaymentIcon sx={{ color: "#FF9080" }} />
                <Typography variant="subtitle1" fontWeight="bold">
                  결제 정보
                </Typography>
              </Stack>
              
              <Typography variant="body1" sx={{ ml: 21 }}>
                결제 일시 : {reservation.paymentInfo?.paymentDate
                  ? formatDate(reservation.paymentInfo.paymentDate)
                  : '없음'} 
              </Typography>
            </Stack>

            <Paper elevation={0} sx={{ px: 3 }}>

              <Grid container spacing={10} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6}>
                  <Stack direction="row" sx={{ mb: 2 }}>
                    <Typography variant="body1" color="text.secondary" sx={{ minWidth: 120 }}>
                      쿠폰 이름 : 
                    </Typography>
                    <Typography variant="body2">
                      {reservation.couponInfo?.couponName || '없음'}
                    </Typography>
                  </Stack>
                  
                  <Stack direction="row" sx={{ mb: 2 }}>
                    <Typography variant="body1" color="text.secondary" sx={{ minWidth: 120 }}>
                      할인 금액 :
                    </Typography>
                    <Typography variant="body2">
                      {reservation.couponInfo?.discountAmount != null
                        ? `${reservation.couponInfo.discountAmount.toLocaleString()} KRW`
                        : '0 KRW'}
                    </Typography>
                  </Stack>
                  
                  <Stack direction="row" sx={{ mb: 2 }}>
                    <Typography variant="body1" color="text.secondary" sx={{ minWidth: 120 }}>
                      사용 포인트 :
                    </Typography>
                    <Typography variant="body2">
                      {reservation.pointUsage?.points != null
                        ? `${reservation.pointUsage.points.toLocaleString()}P`
                        : '0P'}
                    </Typography>
                  </Stack>
                </Grid>

                <Grid item xs={12} sm={6}>
                  
                  <Stack direction="row" sx={{ mb: 2 }}>
                    <Typography variant="body1" color="text.secondary" sx={{ minWidth: 120 }}>
                      결제 방법 :
                    </Typography>
                    <Chip
                      label={reservation.paymentInfo?.paymentMethod || "결제 정보 없음"}
                      color="primary"
                      size="small"
                      variant="outlined"
                    />
                  </Stack>
                  

                  <Stack direction="row" sx={{ mb: 2 }}>
                    <Typography variant="body1" color="text.secondary" sx={{ minWidth: 120 }}>
                      결제 상태 :
                    </Typography>
                    <Chip
                      label={reservation.paymentInfo?.paymentStatus ? "승인" : "미확인"}
                      color={reservation.paymentInfo?.paymentStatus ? "success" : "error"}
                      size="small"
                    />
                  </Stack>

                  <Stack direction="row" sx={{ mb: 2 }}>
                    <Typography variant="body1" color="text.secondary" sx={{ minWidth: 120 }}>
                      결제 금액 :
                    </Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {reservation.paymentInfo?.price?.toLocaleString()} KRW
                    </Typography>
                  </Stack>
                </Grid>
              </Grid>
            </Paper>
          </Box>
        </Box>

        <Box sx={{ mb: 3, px: 3 }}>
        <Divider sx={{ mb: 3 }} />
          <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: "bold" }}>
            추가 요구사항
          </Typography>
          <Paper
            variant="outlined"
            sx={{
              p: 2,
              backgroundColor: "grey.50",
              minHeight: 120, 
            }}
          >
            <Typography variant="body2">
              {reservation.requirements && reservation.requirements.trim() !== '' 
                ? reservation.requirements 
                : '요청사항이 없습니다.'}
            </Typography>
          </Paper>
        </Box>
      </Paper>
      <Divider sx={{ marginY: 3, borderColor: "grey.500", borderWidth: 2 }} />
    </Box>
  );
};

export default ReservationDetail;
