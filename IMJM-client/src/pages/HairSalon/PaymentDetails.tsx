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
import GooglePay from "../../assets/images/google-pay.svg";
import applePay from "../../assets/images/apple-pay.svg";
import GooglePayButton from "@google-pay/button-react";

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
  paymentMethod: "google" | "apple" | "credit_card" | "other";
  paymentStatus: "pending" | "completed" | "failed" | "cancelled";
  transactionId: string;
}

export interface PaymentRequest {
  price: number;
  pointUsage?: PointUsageRequest;
  couponData?: CouponUsageRequest;
  reservation?: ReservationRequest;
}

export interface AllowedPaymentMethod {
  type: "CARD";
  parameters: {
    allowedAuthMethods: ("PAN_ONLY" | "CRYPTOGRAM_3DS")[];
    allowedCardNetworks: ("MASTERCARD" | "VISA")[];
  };
  tokenizationSpecification: {
    type: "PAYMENT_GATEWAY";
    parameters: {
      gateway: string;
      gatewayMerchantId: string;
    };
  };
}

export interface MerchantInfo {
  merchantName: string;
  merchantId: string;
}

export interface TransactionInfo {
  totalPriceStatus: "FINAL";
  totalPrice: string;
  currencyCode: string;
}

export interface PaymentOptions {
  pointUsage?: PointUsageRequest;
  couponData?: CouponUsageRequest;
}

export interface GooglePayRequest {
  apiVersion: number;
  apiVersionMinor: number;
  allowedPaymentMethods: AllowedPaymentMethod[];
  merchantInfo: MerchantInfo;
  transactionInfo: TransactionInfo;
  paymentOptions?: PaymentOptions;
  reservation?: ReservationRequest;
}

function PaymentDetails() {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    stylistId,
    salonName,
    stylistName,
    selectedDate,
    selectedTime,
    selectedType,
    selectedMenu,
    salonId,
  } = location.state || {};

  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [userPoint, setUserPoint] = useState<number>(0);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [usedPoints, setUsedPoints] = useState<number>(0);
  const [requirements, setRequirements] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [pointError, setPointError] = useState<string>("");
  const [isSafariBrowser, setIsSafariBrowser] = useState<boolean>(false);
  const [selectedPayment, setSelectedPayment] = useState<
    "google" | "apple" | null
  >(null);
  const [termsChecked, setTermsChecked] = useState<boolean>(false);
  const [privacyChecked, setPrivacyChecked] = useState<boolean>(false);
  const [refundPolicyChecked, setRefundPolicyChecked] =
    useState<boolean>(false);
  const [agreeAll, setAgreeAllChecked] = useState<boolean>(false);
  const [successModalOpen, setSuccessModalOpen] = useState<boolean>(false);

  const totalAmount = selectedMenu?.price || 0;

  const couponDiscountAmount = selectedCoupon
    ? selectedCoupon.discountType === "percentage"
      ? Math.floor((totalAmount * selectedCoupon.discountValue) / 100)
      : selectedCoupon.discountValue
    : 0;

  const finalAmount = selectedCoupon
    ? (selectedCoupon.discountType === "percentage"
        ? totalAmount - (totalAmount * selectedCoupon.discountValue) / 100
        : totalAmount - selectedCoupon.discountValue) - usedPoints
    : totalAmount - usedPoints;

  const [pointApplied, setPointApplied] = useState<boolean>(false);
  const [effectiveFinalAmount, setEffectiveFinalAmount] =
    useState<number>(finalAmount);

  const allChecked = termsChecked && privacyChecked && refundPolicyChecked;

  const applyPoint = () => {
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

  const resetPoint = () => {
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

  const reservationData: ReservationRequest = {
    stylistId: Number(stylistId),
    reservationDate: selectedDate,
    reservationTime: selectedTime,
    isPaid: false,
    requirements: requirements || "",
    serviceMenuId: selectedMenu?.id || 0,
    salonId: salonId,
  };

  const paymentRequest: PaymentRequest = {
    price: effectiveFinalAmount,
    pointUsage:
      pointApplied && usedPoints > 0
        ? {
            usageType: "USE",
            price: usedPoints,
            content: "결제에 사용된 포인트",
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

  // Google Pay 요청 객체
  const googlePayRequest: GooglePayRequest = {
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

  const handleCheckboxChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: string
  ) => {
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

  const handleAgreeAllChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setAgreeAllChecked(checked);
    setTermsChecked(checked);
    setPrivacyChecked(checked);
    setRefundPolicyChecked(checked);
  };

  const isPointValid = () => {
    return (
      usedPoints === 0 || (usedPoints % 10 === 0 && usedPoints <= userPoint)
    );
  };

  const handleSelectCoupon = (coupon: Coupon) => {
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

  const handlePointChange = (e: any) => {
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

  const handlePaymentSuccess = async (paymentData: any) => {
    try {
      let paymentMethod = "구글페이";
      let paymentToken = null;
      let transactionId = "TEST_" + Date.now();

      if (paymentData && paymentData.paymentMethodData) {
        paymentToken = paymentData.paymentMethodData.tokenizationData?.token;

        if (paymentData.transactionId) {
          transactionId = paymentData.transactionId;
        }
      }

      const reservationData = {
        price: effectiveFinalAmount,
        paymentMethod: paymentMethod,
        transactionId: transactionId,
        paymentStatus: "true",
        paymentInfo: {
          discount_amount: couponDiscountAmount,
          pointUsed: pointApplied ? usedPoints : 0,
          currency: "KRW",
        },
        paymentToken: paymentToken,
        paymentRequest,
        salonName,
      };

      const config = {
        headers: {
          "Content-Type": "application/json",
        },
      };

      const response = await axios.post(
        "/api/salon/reservation/complete",
        reservationData,
        config
      );
      if (response.status === 200) {
        setSuccessModalOpen(true);
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


  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}. ${String(date.getMonth() + 1).padStart(
      2,
      "0"
    )}. ${String(date.getDate()).padStart(2, "0")}`;
  };

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
 
  useEffect(() => {
    if (!salonId || !totalAmount) {
      setError("예약 정보가 올바르지 않습니다.");
      setLoading(false);
      return;
    }

    const fetchCoupons = async () => {
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

  useEffect(() => {
    setEffectiveFinalAmount(finalAmount);
  }, [finalAmount]);

  // 브라우저 타입 확인
  useEffect(() => {
    const isSafari = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      return (
        userAgent.indexOf("safari") !== -1 && userAgent.indexOf("chrome") === -1
      );
    };
    setIsSafariBrowser(isSafari());
  }, []);

  useEffect(() => {
    if (termsChecked && privacyChecked && refundPolicyChecked) {
      setAgreeAllChecked(true);
    } else {
      setAgreeAllChecked(false);
    }
  }, [termsChecked, privacyChecked, refundPolicyChecked]);

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
            {/* 쿠폰 */}
            Coupon
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
          {/* 포인트 */}
          Point
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
            onChange={(e) => {
              const value = e.target.value.replace(/[^0-9]/g, "");
              if (value === "") {
                setUsedPoints(0);
                setPointError("");
                setPointApplied(false);
                return;
              }
              const numValue = parseInt(value, 10);
              handlePointChange({ target: { value: numValue } });
            }}
            error={Boolean(pointError)}
            // helperText={pointError || "포인트는 10단위로만 사용 가능합니다."}
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
              {/* {usedPoints.toLocaleString()}포인트가 성공적으로 적용되었습니다! */}
              {usedPoints.toLocaleString()}Points have been successfully applied!
            </Typography>
          </Box>
        )}
      </Box>

      <Divider sx={{ marginY: 5, borderColor: "grey.500", borderWidth: 2 }} />

      {/* 예약 정보 요약 */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: "bold" }}>
          {/* 예약 정보 */}
          Reservation information
        </Typography>
        <Box sx={{ backgroundColor: "#FDF6F3", borderRadius: 5, p: 3 }}>
          {[
            ["salonName", salonName],
            ["stylistName", stylistName],
            ["selectedDat", selectedDate],
            ["selectedTime", selectedTime],
            ["hairService", selectedType],
            ["serviceName", selectedMenu?.serviceName],
            ["price", `${selectedMenu?.price?.toLocaleString() || 0}원`],
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
          {/* 결제 내역 */}
          Payment history
        </Typography>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
          <Typography>{selectedMenu?.serviceName}:</Typography>
          <Typography>{totalAmount.toLocaleString()}원</Typography>
        </Box>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
          {/* <Typography>쿠폰 할인:</Typography> */}
          <Typography>Coupon Discount:</Typography>
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
          {/* <Typography>포인트 사용:</Typography> */}
          <Typography>Points Used:</Typography>
          <Typography color="error">
            {pointApplied && usedPoints > 0
              ? `-${usedPoints.toLocaleString()}P`
              : "0P"}
          </Typography>
        </Box>
        <Divider sx={{ my: 1, borderWidth: 2 }} />
        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography variant="h6">{/*총 결제금액*/}Total Amoun:</Typography>
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
          {/* *부가세 10% 포함 */}
          *Including 10% VAT
        </Typography>
      </Box>

      <Divider sx={{ marginY: 5, borderColor: "grey.500", borderWidth: 2 }} />
      {/* 결제 방법 선택 */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
          {/*결제 수단*/}Payment Method 
        </Typography>

        <Grid container spacing={2} justifyContent="center">
          <Grid item>
            <Button
              variant="contained"
              onClick={() => setSelectedPayment("google")}
              sx={{
                width: "200px",
                height: "50px",
                backgroundColor: selectedPayment === "google" ? "#333" : "#fff",
                color: "#fff",
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
                  boxShadow: "none", 
                  "& img": {
                    filter: "brightness(2)",
                  },
                },
              }}
            >
              <img
                src={GooglePay}
                alt="Google Pay"
                width="100%"
                height="100%"
                style={{
                  filter: selectedPayment === "google" ? "brightness(2)" : "none",
                }}
              />
            </Button>
          </Grid>

          <Grid item>
          <Button
            variant="contained"
            disabled={!isSafariBrowser}
            onClick={() => setSelectedPayment("apple")}
            sx={{
              width: "200px",
              height: "50px",
              backgroundColor: selectedPayment === "apple" ? "#333" : "#fff",
              color: "#fff",
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
                boxShadow: "none", 
                "& img": {
                  filter: "brightness(2)",
                },
              },
            }}
          >
            <img
              src={applePay}
              alt="Apple Pay"
              style={{
                width: "auto",
                height: "100%",
                maxWidth: "100%",
                filter: selectedPayment === "apple" ? "brightness(2)" : "none",
              }}
            />
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
            {/* 요청사항 */}
            Request Details
          </Typography>
          <TextField
            multiline
            // label="요청사항을 작성해주세요."
            label="Please enter any special requests."
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
            // label="이용약관에 동의합니다."
            label="I agree to the Terms and Conditions"
            />
          <FormControlLabel
            control={
              <Checkbox
                checked={privacyChecked}
                onChange={(e) => handleCheckboxChange(e, "privacy")}
              />
            }
            // label="개인정보 처리방침에 동의합니다."
            label="I have read and agree to the Privacy Policy"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={refundPolicyChecked}
                onChange={(e) => handleCheckboxChange(e, "refundPolicy")}
              />
            }
            // label="취소 및 환불 정책에 동의합니다."
            label="I agree to the Cancellation and Refund Policy"
          />

          <Box sx={{ mt: 1 }}>
            <FormControlLabel
              control={
                <Checkbox checked={agreeAll} onChange={handleAgreeAllChange} />
              }
              // label="전체 동의"
              label="I accept all terms"
            />
          </Box>
        </Box>

        {/* 결제 버튼 영역 */}
        {selectedPayment &&
          allChecked &&
          (pointApplied || usedPoints === 0) && (
            <Box sx={{ mt: 4, display: "flex", justifyContent: "center" }}>
              {selectedPayment === "google" && (
                <GooglePayButton
                  environment="TEST"
                  paymentRequest={{
                    ...googlePayRequest,
                    transactionInfo: {
                      ...googlePayRequest.transactionInfo,
                      totalPrice: effectiveFinalAmount.toString(),
                    },
                  }}
                  onLoadPaymentData={(paymentData) => {
                    handlePaymentSuccess(paymentData);
                  }}
                  buttonType="pay"
                  buttonSizeMode="fill"
                  buttonColor="black"
                  style={{ width: "300px", height: "50px" }}
                />
              )}
            </Box>
          )}

        {!(
          selectedPayment &&
          allChecked &&
          (pointApplied || usedPoints === 0)
        ) && (
          <Box sx={{ mt: 3, textAlign: "center" }}>
            <Typography variant="body2"  sx={{ color: 'error.main' }}>
              {!selectedPayment
                ? /*"결제 수단을 선택해주세요."*/"Please choose the payment method."
                : !allChecked
                ? /*"모든 약관에 동의해주세요."*/"Please agree to all the terms and conditions."
                : usedPoints > 0 && !pointApplied
                ? /*"포인트 적용하기 버튼을 눌러 포인트를 적용해주세요."*/"Press the Apply Point button to apply the point."
                : /*"결제를 진행해주세요."*/"Please proceed with the payment."}
            </Typography>
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
              {/* You can check the reservation information on my page. */}
            </DialogContentText>
          </DialogContent>
          <DialogActions sx={{ padding: 2, justifyContent: "center" }}>
            <Button
              onClick={() => {
                setSuccessModalOpen(false);
                navigate("/my/appointments");
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
}

export default PaymentDetails;