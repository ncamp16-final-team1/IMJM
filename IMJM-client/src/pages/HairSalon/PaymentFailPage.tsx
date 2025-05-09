import React, { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import {
  Box,
  Typography,
  CircularProgress,
  Paper,
  Button,
  Container,
  Alert,
} from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";

const PaymentSuccessPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentInfo, setPaymentInfo] = useState<any>(null);
  const [reservationId, setReservationId] = useState<number | null>(null);
  const [processingStatus, setProcessingStatus] = useState<'initial' | 'processing' | 'completed' | 'failed'>('initial');

  // URL에서 파라미터 추출
  const queryParams = new URLSearchParams(location.search);
  const paymentKey = queryParams.get("paymentKey");
  const orderId = queryParams.get("orderId");
  const amount = queryParams.get("amount");

  // UTF-8 문자열을 Base64로 인코딩
  const utf8ToBase64 = (str: string): string => {
    const encodedURI = encodeURIComponent(str);
    const unescape = encodedURI.replace(
      /%([0-9A-F]{2})/g,
      (_, p1) => String.fromCharCode(parseInt(p1, 16))
    );
    return btoa(unescape);
  };

  // useRef를 추가하여 중복 실행 방지
  const processedRef = useRef(false);

  // 세션스토리지 초기화 함수 추가
  const clearPaymentSessionStorage = useCallback((orderId: string) => {
    console.log("결제 관련 세션스토리지 초기화 중...");
    // 임시 예약 정보 삭제
    sessionStorage.removeItem("pendingReservation");
    // 결제 처리 상태 삭제
    sessionStorage.removeItem(`processing_${orderId}`);
    // 결제 진행 상태 삭제
    sessionStorage.removeItem("payment_in_progress");
    
    console.log("세션스토리지 초기화 완료");
  }, []);

  // 결제 완료 처리 함수
  const completePayment = useCallback(async (
    paymentKey: string,
    orderId: string,
    amount: string
  ) => {
    console.log(`결제 처리 시작: paymentKey=${paymentKey}, orderId=${orderId}, amount=${amount}`);
    
    // 세션 스토리지에서 임시 예약 정보 가져오기
    const pendingReservationData = sessionStorage.getItem("pendingReservation");
    
    if (!pendingReservationData) {
      console.error("예약 정보를 찾을 수 없음: pendingReservation이 세션 스토리지에 존재하지 않음");
      throw new Error("예약 정보를 찾을 수 없습니다. 다시 예약을 진행해주세요.");
    }
    
    try {
      // 결제 정보 구성
      const reservationData = JSON.parse(pendingReservationData);
      console.log("예약 데이터 파싱 완료:", reservationData);
      
      const paymentApprovalData = {
        paymentKey,
        orderId,
        amount: parseInt(amount),
        reservationData: {
          paymentRequest: {
            ...reservationData.paymentRequest,
            orderId,
          },
        },
      };
      console.log("결제 승인 데이터 구성 완료:", paymentApprovalData);
      
      // 데이터 인코딩 및 결제 승인 요청
      const encodedData = utf8ToBase64(JSON.stringify(paymentApprovalData));
      console.log("결제 승인 요청 전송 중...");
      
      const approveResponse = await axios.post("/api/payments/approve", { encodedData });
      console.log("결제 승인 응답 받음:", approveResponse.data);
      
      // 결제 승인이 성공한 경우
      if (approveResponse.data.success) {
        console.log("결제 승인 성공! 예약 ID:", approveResponse.data.reservationId);
        
        const reservationId = approveResponse.data.reservationId;
        
        // 세션스토리지 초기화 함수 호출
        clearPaymentSessionStorage(orderId);
        
        // 완료된 결제 기록 (이 항목은 유지)
        const completedPayments = JSON.parse(sessionStorage.getItem("completedPayments") || "[]");
        completedPayments.push(orderId);
        sessionStorage.setItem("completedPayments", JSON.stringify(completedPayments));
        console.log("완료된 결제 목록 업데이트:", completedPayments);
        
        // 상태 업데이트
        setPaymentInfo(approveResponse.data);
        setReservationId(reservationId);
        setLoading(false);
        console.log("모든 상태 업데이트 완료, 결제 및 예약 프로세스 성공적으로 완료");
        
        // 성공 시 결과 반환 (중요!)
        return {
          ...approveResponse.data,
          reservationId: reservationId
        };
      } else {
        console.error("결제 승인 실패:", approveResponse.data);
        throw new Error(approveResponse.data.message || "결제 승인에 실패했습니다.");
      }
    } catch (error) {
      console.error("결제 처리 중 예외 발생:", error);
      if (axios.isAxiosError(error)) {
        console.error("API 오류 상세 정보:", error.response?.data);
      }
      throw error;
    }
  }, [clearPaymentSessionStorage]);

  // 결제 처리 실행
  useEffect(() => {
    const processPayment = async () => {
      // 중복 실행 방지
      if (processedRef.current) {
        console.log("이미 결제 처리가 시작되었습니다. 중복 실행 방지");
        return;
      }

      // 실행 플래그 설정
      processedRef.current = true;
      
      // 결제 정보 유효성 검사
      if (!paymentKey || !orderId || !amount) {
        setError("결제 정보가 올바르지 않습니다.");
        setLoading(false);
        return;
      }
      
      // 이미 처리된 결제인지 확인
      const completedPayments = JSON.parse(sessionStorage.getItem("completedPayments") || "[]");
      if (completedPayments.includes(orderId)) {
        console.log(`주문 ID ${orderId}는 이미 처리되었습니다.`);
        
        try {
          // 이미 처리된 결제 정보 확인
          const reservationResponse = await axios.get(`/api/payments/reservation/by-order/${orderId}`);
          if (reservationResponse.data && reservationResponse.data.reservationId) {
            // 세션스토리지 초기화 (추가)
            clearPaymentSessionStorage(orderId);
            
            setReservationId(reservationResponse.data.reservationId);
            setPaymentInfo({
              amount: amount,
              orderId: orderId
            });
            setLoading(false);
            return;
          }
        } catch (err) {
          console.warn("예약 정보 조회 실패:", err);
        }
      }

      // 먼저 결제 상태 확인
      try {
        console.log("먼저 결제 상태를 확인합니다...");
        const statusResponse = await axios.get(`/api/payments/status/${paymentKey}`);
        const paymentStatus = statusResponse.data.status;
        
        if (paymentStatus === "DONE") {
          console.log("이미 완료된 결제입니다. 예약 정보를 조회합니다.");
          try {
            const reservationResponse = await axios.get(`/api/payments/reservation/by-order/${orderId}`);
            if (reservationResponse.data && reservationResponse.data.reservationId) {
              // 세션스토리지 초기화 (추가)
              clearPaymentSessionStorage(orderId);
              
              // 완료된 결제 기록 업데이트
              if (!completedPayments.includes(orderId)) {
                completedPayments.push(orderId);
                sessionStorage.setItem("completedPayments", JSON.stringify(completedPayments));
              }
              
              setReservationId(reservationResponse.data.reservationId);
              setPaymentInfo({
                amount: amount,
                orderId: orderId
              });
              setLoading(false);
              return;
            }
          } catch (err) {
            console.warn("예약 정보 조회 실패:", err);
            // 예약 정보 조회 실패 시 계속 진행
          }
        }
      } catch (err) {
        console.warn("결제 상태 확인 중 오류:", err);
        // 상태 확인 실패 시 계속 진행
      }

      // 결제 승인 및 예약 처리 진행
      try {
        // 결제 처리 상태 표시
        const processingStatus = `processing_${orderId}`;
        sessionStorage.setItem(processingStatus, "true");
        sessionStorage.setItem("payment_in_progress", "true"); // 추가: 결제 진행 중 표시
        
        try {
          // 결제 완료 처리 실행
          const result = await completePayment(paymentKey, orderId, amount);
          
          // 세션스토리지 초기화 (추가)
          clearPaymentSessionStorage(orderId);
          
          // 완료된 결제 기록
          completedPayments.push(orderId);
          sessionStorage.setItem("completedPayments", JSON.stringify(completedPayments));
          
          // 결제 정보 설정
          setPaymentInfo(result);
          setReservationId(result.reservationId);
        } catch (err) {
          // 처리 상태 제거
          sessionStorage.removeItem(processingStatus);
          sessionStorage.removeItem("payment_in_progress"); // 추가: 결제 진행 중 표시 제거
          
          console.error("결제 처리 중 오류:", err);
          
          // 오류 처리 로직...
          if (axios.isAxiosError(err) && 
              err.response?.data?.code === "PAYMENT_IN_PROGRESS") {
            
            console.log("결제가 이미 처리 중입니다. 잠시 후 상태 확인을 시도합니다.");
            
            // 5초 대기 후 결제 상태 확인
            setTimeout(async () => {
              try {
                const statusResponse = await axios.get(`/api/payments/status/${paymentKey}`);
                const paymentStatus = statusResponse.data.status;
                
                if (paymentStatus === "DONE") {
                  const reservationResponse = await axios.get(`/api/payments/reservation/by-order/${orderId}`);
                  if (reservationResponse.data && reservationResponse.data.reservationId) {
                    // 세션스토리지 초기화 (추가)
                    clearPaymentSessionStorage(orderId);
                    
                    setReservationId(reservationResponse.data.reservationId);
                    setPaymentInfo({
                      amount: amount,
                      orderId: orderId
                    });
                    setLoading(false);
                    setError(null);
                    return;
                  }
                }
                
                // 여전히 처리되지 않은 경우
                setError("결제 처리 중 지연이 발생했습니다. 마이페이지에서 예약 상태를 확인해주세요.");
              } catch (statusErr) {
                setError("결제 상태 확인 중 오류가 발생했습니다.");
              }
            }, 5000);
          } else if (axios.isAxiosError(err)) {
            // 기타 API 오류
            setError(err.response?.data?.message || "결제 처리 중 오류가 발생했습니다.");
          } else {
            // 일반 오류
            setError(err instanceof Error ? err.message : "예상치 못한 오류가 발생했습니다.");
          }
        }
      } catch (outerErr) {
        console.error("결제 처리 외부 오류:", outerErr);
        setError("결제 처리 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };

    if (paymentKey && orderId && amount) {
      processPayment();
    } else {
      setError("결제 정보가 올바르지 않습니다.");
      setLoading(false);
    }
  }, [paymentKey, orderId, amount, completePayment, clearPaymentSessionStorage]);

  // 추가 정리 로직 (컴포넌트 언마운트 시)
  useEffect(() => {
    return () => {
      // 특정 결제 처리 상태만 제거 (다른 결제에 영향 주지 않도록)
      if (orderId) {
        sessionStorage.removeItem(`processing_${orderId}`);
        sessionStorage.removeItem("payment_in_progress"); // 추가: 결제 진행 중 표시 제거
      }
    };
  }, [orderId]);

  // 마이페이지 이동 함수
  const goToMyPage = () => {
    // 세션스토리지 초기화 추가
    if (orderId) clearPaymentSessionStorage(orderId);
    navigate("/my/appointments");
  };

  // 예약 상세 페이지 이동 함수
  const goToReservationDetail = () => {
    // 세션스토리지 초기화 추가
    if (orderId) clearPaymentSessionStorage(orderId);
    
    if (reservationId) navigate(`/my/reservation-detail/${reservationId}`);
    else goToMyPage();
  };

  // 홈으로 돌아가기 함수 (추가)
  const goToHome = () => {
    // 세션스토리지 초기화
    if (orderId) clearPaymentSessionStorage(orderId);
    navigate("/");
  };

  // 로딩 중 표시
  if (loading) {
    return (
      <Container maxWidth="sm">
        <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="80vh">
          <CircularProgress size={60} sx={{ mb: 3 }} />
          <Typography variant="h6">결제를 처리 중입니다...</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            잠시만 기다려 주세요.
          </Typography>
        </Box>
      </Container>
    );
  }

  // 오류 표시
  if (error) {
    return (
      <Container maxWidth="sm">
        <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="80vh">
          <Alert severity="error" sx={{ width: "100%", mb: 3 }}>
            {error}
          </Alert>
          <Box display="flex" justifyContent="center" gap={2}>
            <Button 
              variant="outlined" 
              onClick={goToHome} // 수정: 홈으로 이동할 때도 세션스토리지 초기화
              sx={{
                borderColor: "#757575",
                color: "#757575",
                "&:hover": {
                  borderColor: "#616161",
                  backgroundColor: "rgba(117, 117, 117, 0.04)",
                },
              }}
            >
              홈으로 돌아가기
            </Button>
            <Button 
              variant="contained" 
              onClick={() => navigate(-1)}
              sx={{
                backgroundColor: "#3445FF",
                "&:hover": {
                  backgroundColor: "#2338DF",
                },
              }}
            >
              이전 페이지로 돌아가기
            </Button>
          </Box>
        </Box>
      </Container>
    );
  }

  // 성공 화면
  return (
    <Container maxWidth="sm">
      <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="80vh" textAlign="center">
        <Paper elevation={3} sx={{ p: 4, borderRadius: 2, width: "100%", backgroundColor: "#fafafa" }}>
          <CheckCircleOutlineIcon color="success" sx={{ fontSize: 64, mb: 2 }} />
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            결제가 완료되었습니다!
          </Typography>
          <Typography variant="body1" paragraph sx={{ mb: 3 }}>
            예약 정보는 마이페이지에서 확인하실 수 있습니다.
          </Typography>
          <Box mt={2}>
            <Typography variant="subtitle1" fontWeight="bold" align="left">
              결제 정보
            </Typography>
            <Box display="flex" justifyContent="space-between" mt={1}>
              <Typography variant="body2">예약 번호:</Typography>
              <Typography variant="body2" fontWeight="medium">
                {reservationId}
              </Typography>
            </Box>
            <Box display="flex" justifyContent="space-between" mt={1}>
              <Typography variant="body2">결제 금액:</Typography>
              <Typography variant="body2" fontWeight="medium">
                {Number(amount).toLocaleString()}원
              </Typography>
            </Box>
            <Box display="flex" justifyContent="space-between" mt={1}>
              <Typography variant="body2">주문 번호:</Typography>
              <Typography variant="body2" fontWeight="medium">
                {orderId}
              </Typography>
            </Box>
          </Box>
          <Box mt={4} display="flex" justifyContent="center" gap={2}>
            <Button
              variant="outlined"
              onClick={goToMyPage}
              sx={{
                borderColor: "#3445FF",
                color: "#3445FF",
                "&:hover": {
                  borderColor: "#2338DF",
                  backgroundColor: "rgba(52, 69, 255, 0.04)",
                },
              }}
            >
              마이페이지
            </Button>
            <Button
              variant="contained"
              onClick={goToReservationDetail}
              sx={{
                backgroundColor: "#3445FF",
                "&:hover": {
                  backgroundColor: "#2338DF",
                },
              }}
            >
              예약 상세 보기
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default PaymentSuccessPage;