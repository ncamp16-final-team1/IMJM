import axios from "axios";
import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  Divider,
  TextField,
  Tooltip,
  Grid,
  Checkbox,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import { loadTossPayments } from '@tosspayments/payment-sdk';
import GooglePayButton from "@google-pay/button-react"; // 추가된 import

// Interfaces
export interface ReservationRequest {
  stylistId: number;
  reservationDate: string;
  reservationTime: string;
  isPaid: boolean;
  requirements: string;
  serviceMenuId: number;
  salonId: string;
}

export type UsageType = "USE" | "SAVE";

export interface PointUsageRequest {
  usageType: UsageType;
  price: number;
  content: string;
}

export interface CouponUsageRequest {
  couponId: number;
  discountAmount: number;
}

interface Coupon {
  couponId: number;
  couponName: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  minimumPurchase: number;
  startDate: string;
  expiryDate: string;
  isActive: boolean;
  isAvailable: boolean;
  totalAmount: number;
}

export interface PaymentInfo {
  price: number;
  paymentMethod: "toss" | "credit_card" | "other";
  paymentStatus: "pending" | "completed" | "failed" | "cancelled";
  transactionId: string;
}

export interface PaymentRequest {
  price: number;
  pointUsage?: PointUsageRequest;
  couponData?: CouponUsageRequest;
  reservation?: ReservationRequest;
}

export interface PaymentOptions {
  pointUsage?: PointUsageRequest;
  couponData?: CouponUsageRequest;
}

interface LocationState {
  stylistId: string;
  salonName: string;
  stylistName: string;
  selectedDate: string;
  selectedTime: string;
  selectedType: string;
  selectedMenu: {
    id: number;
    serviceName: string;
    price: number;
  };
  salonId: string;
}

const PaymentDetails: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState || {};
  
  const {
    stylistId,
    salonName,
    stylistName,
    selectedDate,
    selectedTime,
    selectedType,
    selectedMenu,
    salonId,
  } = state;

  const [reservationId, setReservationId] = useState<number | null>(null);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [userPoint, setUserPoint] = useState<number>(0);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [usedPoints, setUsedPoints] = useState<number>(0);
  const [requirements, setRequirements] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [pointError, setPointError] = useState<string>("");
  const [pointApplied, setPointApplied] = useState<boolean>(false);
  const [effectiveFinalAmount, setEffectiveFinalAmount] = useState<number>(0);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<"card" | "transfer" | "pay" | null>(null);

  const [selectedPayment, setSelectedPayment] = useState<"google" | "apple" | null>(null);
  const [isSafariBrowser, setIsSafariBrowser] = useState<boolean>(false);
  
  // 약관 동의 상태
  const [termsChecked, setTermsChecked] = useState<boolean>(false);
  const [privacyChecked, setPrivacyChecked] = useState<boolean>(false);
  const [refundPolicyChecked, setRefundPolicyChecked] = useState<boolean>(false);
  const [agreeAll, setAgreeAllChecked] = useState<boolean>(false);
  const [successModalOpen, setSuccessModalOpen] = useState<boolean>(false);

  const totalAmount = selectedMenu?.price || 0;

  // 쿠폰 할인 금액 계산
  const couponDiscountAmount = selectedCoupon
    ? selectedCoupon.discountType === "percentage"
      ? Math.floor((totalAmount * selectedCoupon.discountValue) / 100)
      : selectedCoupon.discountValue
    : 0;

  // 최종 금액 계산
  const finalAmount = selectedCoupon
    ? (selectedCoupon.discountType === "percentage"
        ? totalAmount - (totalAmount * selectedCoupon.discountValue) / 100
        : totalAmount - selectedCoupon.discountValue) - usedPoints
    : totalAmount - usedPoints;

  const allChecked = termsChecked && privacyChecked && refundPolicyChecked;
  // 포인트 적용 함수
  const applyPoint = (): void => {
    if (isPointValid() && usedPoints > 0) {
      setPointApplied(true);

      const discountedAmount = selectedCoupon
        ? selectedCoupon.discountType === "percentage"
          ? totalAmount - (totalAmount * selectedCoupon.discountValue) / 100
          : totalAmount - selectedCoupon.discountValue
        : totalAmount;

      setEffectiveFinalAmount(Math.max(0, discountedAmount - usedPoints));
    }
  };

  // 포인트 초기화 함수
  const resetPoint = (): void => {
    setUsedPoints(0);
    setPointError("");
    setPointApplied(false);

    const discountedAmount = selectedCoupon
      ? selectedCoupon.discountType === "percentage"
        ? totalAmount - (totalAmount * selectedCoupon.discountValue) / 100
        : totalAmount - selectedCoupon.discountValue
      : totalAmount;

    setEffectiveFinalAmount(discountedAmount);
  };

  // 예약 데이터 생성
  const reservationData: ReservationRequest = {
    stylistId: Number(stylistId),
    reservationDate: selectedDate,
    reservationTime: selectedTime,
    isPaid: false,
    requirements: requirements || "",
    serviceMenuId: selectedMenu?.id || 0,
    salonId: salonId,
  };

  // 결제 요청 데이터 생성
  const paymentRequest: PaymentRequest = {
    price: effectiveFinalAmount,
    pointUsage:
      pointApplied && usedPoints > 0
        ? {
            usageType: "USE",
            price: usedPoints,
            content: salonName,
          }
        : undefined,
    couponData: selectedCoupon
      ? {
          couponId: selectedCoupon.couponId,
          discountAmount: couponDiscountAmount,
        }
      : undefined,
    reservation: reservationData,
  };

  // 체크박스 변경 핸들러
  const handleCheckboxChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: string
  ): void => {
    switch (type) {
      case "terms":
        setTermsChecked(e.target.checked);
        break;
      case "privacy":
        setPrivacyChecked(e.target.checked);
        break;
      case "refundPolicy":
        setRefundPolicyChecked(e.target.checked);
        break;
      default:
        break;
    }
  };

  // 전체 동의 핸들러
  const handleAgreeAllChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const checked = e.target.checked;
    setAgreeAllChecked(checked);
    setTermsChecked(checked);
    setPrivacyChecked(checked);
    setRefundPolicyChecked(checked);
  };

  // 포인트 유효성 검사
  const isPointValid = (): boolean => {
    return (
      usedPoints === 0 || (usedPoints % 10 === 0 && usedPoints <= userPoint)
    );
  };

  // 쿠폰 선택 핸들러
  const handleSelectCoupon = (coupon: Coupon): void => {
    if (!coupon.isAvailable) return;

    const newSelectedCoupon = coupon === selectedCoupon ? null : coupon;
    setSelectedCoupon(newSelectedCoupon);

    const discountedAmount = newSelectedCoupon
      ? newSelectedCoupon.discountType === "percentage"
        ? totalAmount - (totalAmount * newSelectedCoupon.discountValue) / 100
        : totalAmount - newSelectedCoupon.discountValue
      : totalAmount;

    if (pointApplied) {
      setEffectiveFinalAmount(Math.max(0, discountedAmount - usedPoints));
    } else {
      setEffectiveFinalAmount(discountedAmount);
    }
  };

  // 포인트 입력 핸들러
  const handlePointChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const value = parseInt(e.target.value, 10);

    setPointApplied(false);

    if (isNaN(value)) {
      setUsedPoints(0);
      setPointError("");
      return;
    }

    if (value > userPoint) {
      setUsedPoints(userPoint);
      setPointError("사용 가능한 포인트를 초과했습니다.");
      return;
    }

    if (value % 10 !== 0) {
      setUsedPoints(value);
      setPointError("10단위로만 포인트를 사용할 수 있습니다.");
      return;
    }

    setUsedPoints(value);
    setPointError("");
  };
  // Toss 결제 처리 함수
 // Toss 결제 처리 함수
 const handleTossPayment = async (): Promise<void> => {
  // 1. 결제 진행 중 여부 확인
  const paymentInProgress = sessionStorage.getItem('payment_in_progress');
  
  if (paymentInProgress === 'true') {
    alert('결제가 이미 진행 중입니다. 잠시만 기다려주세요.');
    return;
  }

  try {
    // 결제 진행 중 상태 설정
    sessionStorage.setItem('payment_in_progress', 'true');
    sessionStorage.setItem('last_payment_attempt', Date.now().toString());

    // 결제 정보 준비
    const randomStr = Math.random().toString(36).substring(2, 10);
    const orderId = `ORDER_${Date.now()}_${randomStr}`;
    
    // 결제 예약 정보 구조화
    const pendingReservationData = {
      price: effectiveFinalAmount,
      paymentRequest: {
        price: effectiveFinalAmount,
        pointUsage: pointApplied && usedPoints > 0
          ? {
              usageType: "USE",
              price: usedPoints,
              content: salonName
            }
          : undefined,
        couponData: selectedCoupon
          ? {
              couponId: selectedCoupon.couponId,
              discountAmount: couponDiscountAmount
            }
          : undefined,
        reservation: {
          stylistId: Number(stylistId),
          reservationDate: selectedDate,
          reservationTime: selectedTime,
          isPaid: false,
          requirements: requirements || "",
          serviceMenuId: selectedMenu?.id || 0,
          salonId: salonId
        }
      },
      paymentMethod: "toss",
      transactionId: orderId,
      paymentStatus: "pending",
      salonName,
      orderId,
      timestamp: Date.now()
    };

    // 세션 스토리지에 결제 정보 저장
    sessionStorage.setItem('pendingReservation', JSON.stringify(pendingReservationData));

    // Toss Payments SDK 로드
    const tossPayments = await loadTossPayments('test_ck_Z1aOwX7K8mYjwKPqOvDj8yQxzvNP');

    // 결제 방식 매핑
    const paymentMethodMap: { [key: string]: string } = {
      'card': '카드',
      'transfer': '계좌이체',
      'pay': '토스페이'
    };

    // 결제 방식 검증
    if (!selectedPaymentMethod || !paymentMethodMap[selectedPaymentMethod]) {
      throw new Error('결제 수단을 선택해주세요.');
    }

    try {
      await tossPayments.requestPayment(paymentMethodMap[selectedPaymentMethod], {
        amount: effectiveFinalAmount,
        orderId: orderId,
        orderName: `${salonName} - ${selectedMenu?.serviceName || '예약'}`,
        successUrl: `${window.location.origin}/payment/success`,
        failUrl: `${window.location.origin}/payment/fail`,
        customerName: '신동억억', // 실제 사용자 정보로 대체
        customerEmail: 'ehrflqakstp@gmail.com', // 실제 사용자 이메일로 대체
        windowTarget: '_self',
        availablePaymentMethod: [selectedPaymentMethod],
        metadata: {
          timestamp: Date.now().toString()
        }
      });
    } catch (tossError) {
      // 결제 실패 처리
      console.error('Toss payment SDK error:', tossError);

      // 실패 정보 로깅
      try {
        await axios.post('/api/payments/fail', {
          code: tossError.code || 'PAYMENT_FAILED',
          message: tossError.message || '결제에 실패했습니다.',
          orderId: orderId
        });
      } catch (logError) {
        console.error('결제 실패 로깅 중 오류:', logError);
      }

      // 세션 스토리지 정리
      sessionStorage.removeItem('payment_in_progress');
      sessionStorage.removeItem('pendingReservation');

      // 사용자에게 오류 표시
      alert(tossError.message || '결제에 실패했습니다. 다시 시도해주세요.');
    }
  } catch (error) {
    console.error('Toss payment error:', error);

    // 세션 스토리지 정리
    sessionStorage.removeItem('payment_in_progress');
    sessionStorage.removeItem('pendingReservation');

    // 사용자에게 오류 표시
    alert(error instanceof Error ? error.message : '예상치 못한 오류가 발생했습니다.');
  }
};
  // 날짜 포맷 함수
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return `${date.getFullYear()}. ${String(date.getMonth() + 1).padStart(
      2,
      "0"
    )}. ${String(date.getDate()).padStart(2, "0")}`;
  };

  // 쿠폰 비활성화 메시지 생성 함수
  const getDisabledMessage = (coupon: Coupon): string => {
    if (!coupon.isActive) return "이 쿠폰은 현재 비활성화 상태입니다.";
    if (coupon.minimumPurchase > totalAmount)
      return `최소 주문 금액(${coupon.minimumPurchase.toLocaleString()}원)을 충족하지 않습니다.`;

    const now = new Date();
    const start = new Date(coupon.startDate);
    const expiry = new Date(coupon.expiryDate);

    if (now < start) return "아직 사용 기간이 시작되지 않았습니다.";
    if (now > expiry) return "사용 기간이 만료되었습니다.";

    return "이미 사용한 쿠폰입니다.";
  };

// 브라우저 타입 확인 (애플페이 사용 가능 여부 확인)
useEffect(() => {
  const isSafari = () => {
    const userAgent = navigator.userAgent.toLowerCase();
    return (
      userAgent.indexOf("safari") !== -1 && userAgent.indexOf("chrome") === -1
    );
  };
  setIsSafariBrowser(isSafari());
}, []);

// 구글페이/애플페이 결제 성공 처리 함수 추가
const handleDirectPaymentSuccess = async (paymentData: any) => {
  try {
    let paymentMethod = selectedPayment === "google" ? "google" : "apple";
    let paymentToken = null;
    let transactionId = "PAY_" + Date.now();

    if (paymentData && paymentData.paymentMethodData) {
      paymentToken = paymentData.paymentMethodData.tokenizationData?.token;

      if (paymentData.transactionId) {
        transactionId = paymentData.transactionId;
      }
    }
/////////////////////////////////////////
    // 결제 정보 구성 - 서버에서 처리할 수 있는 형태로 구성
    const reservationData = {
      price: effectiveFinalAmount,
      paymentMethod: paymentMethod,
      transactionId: transactionId,
      paymentStatus: "COMPLETED",
      paymentInfo: {
        discount_amount: couponDiscountAmount,
        pointUsed: pointApplied ? usedPoints : 0,
        currency: "KRW",
      },
      paymentToken: paymentToken,
      paymentRequest: {
        price: effectiveFinalAmount,
        pointUsage: pointApplied && usedPoints > 0
          ? {
              usageType: "USE",
              price: usedPoints,
              content: salonName
            }
          : undefined,
        couponData: selectedCoupon
          ? {
              couponId: selectedCoupon.couponId,
              discountAmount: couponDiscountAmount
            }
          : undefined,
        reservation: {
          stylistId: Number(stylistId),
          reservationDate: selectedDate,
          reservationTime: selectedTime,
          isPaid: false,
          requirements: requirements || "",
          serviceMenuId: selectedMenu?.id || 0,
          salonId: salonId
        }
      },
      salonName,
      orderId: transactionId,
    };

    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };

    console.log("구글/애플페이 결제 정보 전송:", reservationData);

    // 예약 완료 API 호출
    const response = await axios.post(
      "/api/salon/reservation/complete",
      reservationData,
      config
    );
    
    if (response.status === 200 && response.data?.success) {
      const reservationIdFromServer = response.data.reservationId;
      setReservationId(reservationIdFromServer);
      setSuccessModalOpen(true); // 성공 시에만 모달 열기
    } else {
      alert(
        "예약 처리 실패: " + (response.data?.message || "알 수 없는 오류")
      );
    }
  } catch (error) {
    console.error("서버 요청 오류:", error);

    if (axios.isAxiosError(error) && error.response) {
      console.error("응답 상태:", error.response.status);
      console.error("응답 데이터:", error.response.data);
      alert(
        `서버 오류 (${error.response.status}): ${
          error.response.data?.message || "알 수 없는 오류"
        }`
      );
    } else {
      alert("서버 요청 중 오류가 발생했습니다.");
    }
  }
};

// 구글페이 결제 요청 객체 추가
const googlePayRequest = {
  apiVersion: 2,
  apiVersionMinor: 0,
  allowedPaymentMethods: [
    {
      type: "CARD",
      parameters: {
        allowedAuthMethods: ["PAN_ONLY", "CRYPTOGRAM_3DS"],
        allowedCardNetworks: ["MASTERCARD", "VISA"],
      },
      tokenizationSpecification: {
        type: "PAYMENT_GATEWAY",
        parameters: {
          gateway: "example",
          gatewayMerchantId: "exampleGatewayMerchantId",
        },
      },
    },
  ],
  merchantInfo: {
    merchantName: salonName,
    merchantId: "exampleMerchantId",
  },
  transactionInfo: {
    totalPriceStatus: "FINAL",
    totalPrice: effectiveFinalAmount.toString(),
    currencyCode: "KRW",
  },
};


/////////////////////////////////////////
// 결제 페이지 로드 시 세션스토리지 초기화
useEffect(() => {
  console.log("결제 페이지 로드: 세션스토리지 초기화 중...");
  
  // 결제 진행 중 표시 제거
  sessionStorage.removeItem("payment_in_progress");
  
  // 모든 processing_ 항목 제거
  const keys = Object.keys(sessionStorage);
  const processingKeys = keys.filter(key => key.startsWith('processing_'));
  processingKeys.forEach(key => {
    sessionStorage.removeItem(key);
  });
  
  console.log("결제 페이지 초기화 완료");
}, []);




  // 쿠폰 및 포인트 데이터 로드
  useEffect(() => {
    if (!salonId || !totalAmount) {
      setError("예약 정보가 올바르지 않습니다.");
      setLoading(false);
      return;
    }

    const fetchCoupons = async (): Promise<void> => {
      try {
        const [couponsRes, pointsRes] = await Promise.allSettled([
          axios.get<Coupon[]>(`/api/salon/reservation/coupons`, {
            params: {
              salonId: salonId,
              totalAmount: totalAmount,
            },
          }),
          axios.get<{ id: string; points: number }>(
            `/api/salon/points/available`
          ),
        ]);

        if (couponsRes.status === "fulfilled") {
          setCoupons(couponsRes.value.data);
        } else {
          console.error("쿠폰 불러오기 실패:", couponsRes.reason);
          setError("쿠폰을 불러오는 데 실패했습니다.");
        }

        if (pointsRes.status === "fulfilled") {
          setUserPoint(pointsRes.value.data.points);
        } else {
          console.error("포인트 불러오기 실패:", pointsRes.reason);
        }
      } catch (err) {
        console.error("예상치 못한 에러:", err);
        setError("데이터를 불러오는 데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchCoupons();
  }, [salonId, totalAmount]);

  // 최종 금액 업데이트
  useEffect(() => {
    setEffectiveFinalAmount(finalAmount);
  }, [finalAmount]);

  // 약관 동의 상태 업데이트
  useEffect(() => {
    if (termsChecked && privacyChecked && refundPolicyChecked) {
      setAgreeAllChecked(true);
    } else {
      setAgreeAllChecked(false);
    }
  }, [termsChecked, privacyChecked, refundPolicyChecked]);

  // 쿠폰/포인트 적용 시 최종 금액 업데이트
  useEffect(() => {
    const discountedAmount = selectedCoupon
      ? selectedCoupon.discountType === "percentage"
        ? totalAmount - (totalAmount * selectedCoupon.discountValue) / 100
        : totalAmount - selectedCoupon.discountValue
      : totalAmount;

    setEffectiveFinalAmount(
      pointApplied
        ? Math.max(0, discountedAmount - usedPoints)
        : discountedAmount
    );
  }, [selectedCoupon, totalAmount, pointApplied, usedPoints]);

  if (loading) {
    return (
      <Box sx={{ maxWidth: 400, mx: "auto", p: 2 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
            로딩중...
          </Typography>
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          textAlign: "center",
          p: 3,
        }}
      >
        <Typography variant="h6" color="error">
          {error}
        </Typography>
      </Box>
    );
  }
  return (
    <Box sx={{ maxWidth: 800, mx: "auto" }}>
      {/* 쿠폰 섹션 */}
      <Box sx={{ mb: 3 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: "bold" }}>
            쿠폰
          </Typography>
          <Typography
            variant="caption"
            sx={{ color: "#757575", cursor: "pointer" }}
          >
          </Typography>
        </Box>

        {coupons.length === 0 ? (
          <Typography>사용 가능한 쿠폰이 없습니다.</Typography>
        ) : (
          <Box
            sx={{
              maxHeight: 300,
              overflow: "auto",
              scrollbarWidth: "none",
              "&::-webkit-scrollbar": {
                display: "none",
              },
            }}
          >
            {coupons.map((coupon) => (
              <Tooltip
                key={coupon.couponId}
                title={!coupon.isAvailable ? getDisabledMessage(coupon) : ""}
                placement="top"
              >
                <Box
                  onClick={() => handleSelectCoupon(coupon)}
                  sx={{
                    display: "flex",
                    bgcolor: "white",
                    borderRadius: 2,
                    border:
                      selectedCoupon?.couponId === coupon.couponId
                        ? "5px solid #FFE500"
                        : coupon.isAvailable
                        ? "2px solid #FFE500"
                        : "2px solid #e0e0e0",
                    overflow: "hidden",
                    mb: 1.5,
                    cursor: coupon.isAvailable ? "pointer" : "default",
                    opacity: coupon.isAvailable ? 1 : 0.6,
                    position: "relative",
                    "&:hover": {
                      boxShadow: "none", // 그림자 제거
                    },
                    "&::after": !coupon.isAvailable
                      ? {
                          content: '""',
                          position: "absolute",
                          top: 0,
                          left: 0,
                          width: "100%",
                          height: "100%",
                          background:
                            "repeating-linear-gradient(45deg, rgba(0,0,0,0.03), rgba(0,0,0,0.03) 10px, rgba(0,0,0,0.06) 10px, rgba(0,0,0,0.06) 20px)",
                        }
                      : {},
                  }}
                >
                  {/* 왼쪽 할인 정보 영역 */}
                  <Box
                    sx={{
                      width: 80,
                      bgcolor: !coupon.isAvailable
                        ? "#f5f5f5"
                        : selectedCoupon?.couponId === coupon.couponId
                        ? "#FFE500"
                        : "#FFE500",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      position: "relative",
                      py: 1.5,
                      zIndex: 1,
                      "&::after": {
                        content: '""',
                        position: "absolute",
                        right: 0,
                        top: 0,
                        height: "100%",
                        borderRight: "2px dashed #eee",
                      },
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{ color: "#757575", fontWeight: "bold" }}
                    >
                      {salonName}
                    </Typography>
                    {coupon.discountType === "percentage" ? (
                      <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                        {coupon.discountValue}% 할인
                      </Typography>
                    ) : (
                      <>
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: "bold", textAlign: "center" }}
                        >
                          {coupon.discountValue.toLocaleString()}원
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{ color: "#757575", fontSize: "10px" }}
                        >
                          (USD {(coupon.discountValue / 1500).toFixed(2)})
                        </Typography>
                      </>
                    )}
                  </Box>

                  {/* 오른쪽 쿠폰 정보 영역 */}
                  <Box
                    sx={{
                      flex: 1,
                      p: 1.5,
                      display: "flex",
                      justifyContent: "space-between",
                      zIndex: 1,
                    }}
                  >
                    <Box>
                      <Typography
                        variant="subtitle2"
                        sx={{ fontWeight: "bold", mb: 0.5 }}
                      >
                        {coupon.couponName}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{ display: "block", color: "#757575" }}
                      >
                        {formatDate(coupon.expiryDate)}까지 사용 가능
                      </Typography>
                      <Typography variant="caption" sx={{ color: "#757575" }}>
                        {coupon.minimumPurchase > 0
                          ? `${coupon.minimumPurchase.toLocaleString()}원 이상 구매 시 사용 가능`
                          : "최소 구매금액 없음"}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Tooltip>
            ))}
          </Box>
        )}
      </Box>

      <Divider sx={{ marginY: 5, borderColor: "grey.500", borderWidth: 2 }} />
      {/* 포인트 섹션 */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: "bold" }} gutterBottom>
          포인트
        </Typography>
        <Typography sx={{ mb: 2 }}>
          보유 포인트: {userPoint ? userPoint.toLocaleString() : 0}포인트
        </Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          <TextField
            fullWidth
            label="사용할 포인트"
            type="text"
            value={usedPoints === 0 ? "" : usedPoints}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              const value = e.target.value.replace(/[^0-9]/g, "");
              if (value === "") {
                setUsedPoints(0);
                setPointError("");
                setPointApplied(false);
                return;
              }
              const numValue = parseInt(value, 10);
              handlePointChange({ 
                target: { 
                  value: numValue,
                  name: '',
                  checked: false
                } 
              } as React.ChangeEvent<HTMLInputElement>);
            }}
            error={Boolean(pointError)}
            helperText={pointError || "포인트는 10단위로만 사용 가능합니다."}
            InputLabelProps={{
              shrink: true,
            }}
            inputProps={{
              inputMode: "numeric",
              pattern: "[0-9]*",
            }}
            variant="outlined"
            sx={{ flex: 1 }}
            disabled={pointApplied}
          />
          <Button
            variant="contained"
            onClick={pointApplied ? resetPoint : applyPoint}
            disabled={!isPointValid() || (usedPoints === 0 && !pointApplied)}
            sx={{
              height: "56px",
              minWidth: "140px",
              backgroundColor: pointApplied ? "#f44336" : "#2196f3",
              boxShadow: 'none', 
              "&:hover": {
                backgroundColor: pointApplied ? "#d32f2f" : "#1976d2",
                boxShadow: 'none', 
              },
              "&.Mui-disabled": {
                boxShadow: 'none', 
              },
            }}
          >
            {pointApplied ? "포인트 초기화" : "포인트 적용하기"}
          </Button>
        </Box>
        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
          <Typography>남은 포인트: {userPoint
              ? (userPoint - (pointApplied ? usedPoints : 0)).toLocaleString()
              : 0}포인트
          </Typography>
        </Box>
        {pointApplied && usedPoints > 0 && (
          <Box sx={{ mt: 1, p: 1, bgcolor: "#e3f2fd", borderRadius: 1 }}>
            <Typography variant="body2" color="primary">
              {usedPoints.toLocaleString()}포인트가 성공적으로 적용되었습니다!
            </Typography>
          </Box>
        )}
      </Box>

      <Divider sx={{ marginY: 5, borderColor: "grey.500", borderWidth: 2 }} />

      {/* 예약 정보 요약 */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: "bold" }}>
          예약 정보
        </Typography>
        <Box sx={{ backgroundColor: "#FDF6F3", borderRadius: 5, p: 3 }}>
          {[
            ["미용실", salonName],
            ["디자이너", stylistName],
            ["예약 날짜", selectedDate],
            ["예약 시간", selectedTime],
            ["서비스 타입", selectedType],
            ["서비스명", selectedMenu?.serviceName],
            ["가격", `${selectedMenu?.price?.toLocaleString() || 0}원`],
          ].map(([label, value], idx) => (
            <Box
              key={idx}
              sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
            >
              <Typography>{label}:</Typography>
              <Typography>{value}</Typography>
            </Box>
          ))}
        </Box>
      </Box>

      <Divider sx={{ marginY: 5, borderColor: "grey.500", borderWidth: 2 }} />
      {/* 결제 내역 섹션 */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: "bold" }}>
          결제 내역
        </Typography>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
          <Typography>{selectedMenu?.serviceName}:</Typography>
          <Typography>{totalAmount.toLocaleString()}원</Typography>
        </Box>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
          <Typography>쿠폰 할인:</Typography>
          <Typography color="error">
            {selectedCoupon
              ? selectedCoupon.discountType === "percentage"
                ? `-${(
                    (totalAmount * selectedCoupon.discountValue) /
                    100
                  ).toLocaleString()}원 (${selectedCoupon.discountValue}%)`
                : `-${selectedCoupon.discountValue.toLocaleString()}원`
              : "0원"}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
          <Typography>포인트 사용:</Typography>
          <Typography color="error">
            {pointApplied && usedPoints > 0
              ? `-${usedPoints.toLocaleString()}P`
              : "0P"}
          </Typography>
        </Box>
        <Divider sx={{ my: 1, borderWidth: 2 }} />
        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography variant="h6">총 결제금액:</Typography>
          <Typography variant="h6" color="error">
            {Math.max(0, effectiveFinalAmount).toLocaleString()}원
          </Typography>
        </Box>
        <Typography
          variant="caption"
          sx={{
            display: "block",
            textAlign: "right",
            color: "#757575",
            mt: 0.5,
          }}
        >
          *부가세 10% 포함
        </Typography>
      </Box>

      <Divider sx={{ marginY: 5, borderColor: "grey.500", borderWidth: 2 }} />
      {/* 결제 방법 선택 */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
          결제 수단
        </Typography>

        <Grid container spacing={2} justifyContent="center">
  {/* 토스페이먼츠 결제 버튼들 */}
  <Grid item>
    <Button
      variant="contained"
      onClick={() => {
        setSelectedPaymentMethod("card");
        setSelectedPayment(null);
      }}
      sx={{
        width: "200px",
        height: "50px",
        backgroundColor: selectedPaymentMethod === "card" ? "#3445FF" : "#fff",
        color: selectedPaymentMethod === "card" ? "#fff" : "#3445FF",
        fontSize: "16px",
        fontWeight: "bold",
        borderRadius: "4px",
        padding: "0px",
        display: "flex",
        justifyContent: "center",
        boxShadow: "none", 
        border: "1px solid #3445FF",
        alignItems: "center",
        textTransform: "none",
        "&:hover": {
          backgroundColor: "#3445FF",
          color: "#fff",
          boxShadow: "none", 
        },
      }}
    >
      카드결제
    </Button>
  </Grid>
  <Grid item>
    <Button
      variant="contained"
      onClick={() => {
        setSelectedPaymentMethod("transfer");
        setSelectedPayment(null);
      }}
      sx={{
        width: "200px",
        height: "50px",
        backgroundColor: selectedPaymentMethod === "transfer" ? "#3445FF" : "#fff",
        color: selectedPaymentMethod === "transfer" ? "#fff" : "#3445FF",
        fontSize: "16px",
        fontWeight: "bold",
        borderRadius: "4px",
        padding: "0px",
        display: "flex",
        justifyContent: "center",
        boxShadow: "none", 
        border: "1px solid #3445FF",
        alignItems: "center",
        textTransform: "none",
        "&:hover": {
          backgroundColor: "#3445FF",
          color: "#fff",
          boxShadow: "none", 
        },
      }}
    >
      계좌이체
    </Button>
  </Grid>
  <Grid item>
    <Button
      variant="contained"
      onClick={() => {
        setSelectedPaymentMethod("pay");
        setSelectedPayment(null);
      }}
      sx={{
        width: "200px",
        height: "50px",
        backgroundColor: selectedPaymentMethod === "pay" ? "#3445FF" : "#fff",
        color: selectedPaymentMethod === "pay" ? "#fff" : "#3445FF",
        fontSize: "16px",
        fontWeight: "bold",
        borderRadius: "4px",
        padding: "0px",
        display: "flex",
        justifyContent: "center",
        boxShadow: "none", 
        border: "1px solid #3445FF",
        alignItems: "center",
        textTransform: "none",
        "&:hover": {
          backgroundColor: "#3445FF",
          color: "#fff",
          boxShadow: "none", 
        },
      }}
    >
      페이 결제
    </Button>
  </Grid>
  
  {/* 구글페이 버튼 */}
  <Grid item>
    <Button
      variant="contained"
      onClick={() => {
        setSelectedPayment("google");
        setSelectedPaymentMethod(null);
      }}
      sx={{
        width: "200px",
        height: "50px",
        backgroundColor: selectedPayment === "google" ? "#000" : "#fff",
        color: selectedPayment === "google" ? "#fff" : "#000",
        fontSize: "16px",
        fontWeight: "bold",
        borderRadius: "4px",
        padding: "0px",
        display: "flex",
        justifyContent: "center",
        boxShadow: "none",
        border: "1px solid #000",
        alignItems: "center",
        textTransform: "none",
        "&:hover": {
          backgroundColor: "#333",
          color: "#fff",
          boxShadow: "none",
        },
      }}
    >
      Google Pay
    </Button>
  </Grid>
  
  {/* 애플페이 버튼 (사파리 브라우저에서만 활성화) */}
  <Grid item>
    <Button
      variant="contained"
      disabled={!isSafariBrowser}
      onClick={() => {
        setSelectedPayment("apple");
        setSelectedPaymentMethod(null);
      }}
      sx={{
        width: "200px",
        height: "50px",
        backgroundColor: selectedPayment === "apple" ? "#000" : "#fff",
        color: selectedPayment === "apple" ? "#fff" : "#000",
        fontSize: "16px",
        fontWeight: "bold",
        borderRadius: "4px",
        padding: "0px",
        display: "flex",
        justifyContent: "center",
        boxShadow: "none",
        border: "1px solid #000",
        alignItems: "center",
        textTransform: "none",
        "&:hover": {
          backgroundColor: "#333",
          color: "#fff",
          boxShadow: "none",
        },
      }}
    >
      Apple Pay
    </Button>
    {!isSafariBrowser && (
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ display: "block", mt: 0.5, textAlign: "center" }}
      >
        Safari 브라우저에서만 사용 가능합니다.
      </Typography>
    )}
  </Grid>
</Grid>

        <Divider sx={{ marginY: 5, borderColor: "grey.500", borderWidth: 2 }} />
        {/* 요청사항 */}
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h5"
            gutterBottom
            sx={{ fontWeight: "bold", mb: 5 }}
          >
            요청사항
          </Typography>
          <TextField
            multiline
            label="요청사항을 작성해주세요."
            fullWidth
            value={requirements}
            rows={4}
            maxRows={6}
            variant="outlined"
            onChange={(e) => setRequirements(e.target.value)}
            sx={{
              "& .MuiOutlinedInput-root": {
                "&:hover fieldset": {
                  borderColor: "#FDE4D0",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#FDE4D0",
                },
              },
              "& label": {
                color: "#999",
              },
              "& label.Mui-focused": {
                color: "#FDC7BF",
              },
              "&:hover label": {
                color: "#FDC7BF",
              },
            }}
          />
        </Box>

        {/* 약관 동의 섹션 */}
        <Box sx={{ mb: 3 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={termsChecked}
                onChange={(e) => handleCheckboxChange(e, "terms")}
              />
            }
            label="이용약관에 동의합니다."
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={privacyChecked}
                onChange={(e) => handleCheckboxChange(e, "privacy")}
              />
            }
            label="개인정보 처리방침에 동의합니다."
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={refundPolicyChecked}
                onChange={(e) => handleCheckboxChange(e, "refundPolicy")}
              />
            }
            label="취소 및 환불 정책에 동의합니다."
          />

          <Box sx={{ mt: 1 }}>
            <FormControlLabel
              control={
                <Checkbox checked={agreeAll} onChange={handleAgreeAllChange} />
              }
              label="전체 동의"
            />
          </Box>
        </Box>
        {/* 결제 버튼 영역 */}
{(selectedPaymentMethod || selectedPayment) &&
  allChecked &&
  (pointApplied || usedPoints === 0) && (
    <Box sx={{ mt: 4, display: "flex", justifyContent: "center" }}>
      {/* 토스페이먼츠 결제 버튼 */}
      {selectedPaymentMethod && (
        <Button
          onClick={handleTossPayment}
          variant="contained"
          sx={{
            width: "300px",
            height: "50px",
            backgroundColor: "#3445FF",
            color: "#fff",
            fontSize: "16px",
            fontWeight: "bold",
            boxShadow: "none",
            "&:hover": {
              backgroundColor: "#2338DF",
              boxShadow: "none",
            },
          }}
        >
          {effectiveFinalAmount.toLocaleString()}원 결제하기
        </Button>
      )}
      
      {/* 구글페이 결제 버튼 */}
      {selectedPayment === "google" && (
        <GooglePayButton
          environment="TEST"
          paymentRequest={{
            apiVersion: 2,
            apiVersionMinor: 0,
            allowedPaymentMethods: [
              {
                type: "CARD",
                parameters: {
                  allowedAuthMethods: ["PAN_ONLY", "CRYPTOGRAM_3DS"],
                  allowedCardNetworks: ["MASTERCARD", "VISA"],
                },
                tokenizationSpecification: {
                  type: "PAYMENT_GATEWAY",
                  parameters: {
                    gateway: "example",
                    gatewayMerchantId: "exampleGatewayMerchantId",
                  },
                },
              },
            ],
            merchantInfo: {
              merchantName: salonName,
              merchantId: "exampleMerchantId",
            },
            transactionInfo: {
              totalPriceStatus: "FINAL",
              totalPrice: effectiveFinalAmount.toString(),
              currencyCode: "KRW",
            },
          }}
          onLoadPaymentData={(paymentData) => {
            handleDirectPaymentSuccess(paymentData);
          }}
          buttonType="pay"
          buttonSizeMode="fill"
          buttonColor="black"
          style={{ width: "300px", height: "50px" }}
        />
      )}
      
      {/* 애플페이 결제 버튼 */}
      {selectedPayment === "apple" && isSafariBrowser && (
        <Button
          onClick={() => {
            // 애플페이 테스트용 호출
            handleDirectPaymentSuccess({
              paymentMethodData: {
                tokenizationData: { token: "apple-pay-token" }
              },
              transactionId: "APPLE_" + Date.now()
            });
          }}
          variant="contained"
          sx={{
            width: "300px",
            height: "50px",
            backgroundColor: "#000",
            color: "#fff",
            fontSize: "16px",
            fontWeight: "bold",
            boxShadow: "none",
            "&:hover": {
              backgroundColor: "#333",
              boxShadow: "none",
            },
          }}
        >
          Apple Pay로 결제하기
        </Button>
      )}
    </Box>
  )}

        {/* 결제 성공 모달 */}
        <Dialog
          open={successModalOpen}
          onClose={() => {
            setSuccessModalOpen(false);
            navigate("/my/appointments");
          }}
          aria-labelledby="payment-success-dialog-title"
        >
          <DialogTitle
            id="payment-success-dialog-title"
            sx={{
              backgroundColor: "#FDF6F3",
              color: "#333",
              fontWeight: "bold",
              textAlign: "center",
            }}
          >
            예약 완료
          </DialogTitle>
          <DialogContent sx={{ padding: 3, minWidth: "300px", mt:2 }}>
            <DialogContentText
              sx={{ textAlign: "center", fontSize: "14px", color: "#666" }}
            >
              예약 정보는 마이페이지에서 확인하실 수 있습니다.
            </DialogContentText>
          </DialogContent>
          <DialogActions sx={{ padding: 2, justifyContent: "center" }}>
            <Button
              onClick={() => {
                setSuccessModalOpen(false);
                navigate(`/my/reservation-detail/${reservationId}`);
              }}
              variant="contained"
              sx={{
                backgroundColor: "#FDC7BF",
                color: "#fff",
                width: "80%",
                boxShadow: "none", 
                "&:hover": {
                  backgroundColor: "#FF9080",
                  boxShadow: "none", 
                },
              }}
            >
              확인
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
};

export default PaymentDetails;