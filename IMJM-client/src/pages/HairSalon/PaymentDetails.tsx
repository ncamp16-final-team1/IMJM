import axios from 'axios';
import { useEffect, useState } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Divider, 
  TextField, 
  CircularProgress, 
  Tooltip,
  Grid,
  Checkbox,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions   
} from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import GooglePay from '../../assets/images/google-pay.svg';
import applePay from '../../assets/images/apple-pay.svg';
// import ApplePayButton from 'react-apple-pay-button';
import GooglePayButton from '@google-pay/button-react';

import {
  ReservationRequest,
  PointUsageRequest,
  CouponUsageRequest,
  GooglePayRequest,
} from '../../type/reservation/payment';

// 인터페이스 정의
interface PaymentData {
  totalPrice: string;
  paymentMethod: string;
  transactionId: string;
}

interface PaymentRequest {
  price: number;
  // pointUsage?: PointUsage;
  // couponData?: CouponData;
  // reservation: ReservationData;
}

interface Coupon {
  couponId: number;
  couponName: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minimumPurchase: number;
  startDate: string;
  expiryDate: string;
  isActive: boolean;
  isAvailable: boolean;
  totalAmount: number;
}

export interface ReservationWithPointUsageRequest {
  reservation: ReservationRequest;
  pointUsage: PointUsageRequest;
  couponData: CouponUsageRequest;
}

function PaymentDetails() {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    stylistId,
    stylistName,
    selectedDate,
    selectedTime,
    selectedType,
    selectedMenu,
    salonId
  } = location.state || {};

  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [userPoint, setUserPoint] = useState<number>(0);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [usedPoints, setUsedPoints] = useState<number>(0);
  const [requirements, setRequirements] = useState<string>('');

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [pointError, setPointError] = useState("");
  const [isSafariBrowser, setIsSafariBrowser] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<'google' | 'apple' | null>(null);
  
  const [termsChecked, setTermsChecked] = useState(false);
  const [privacyChecked, setPrivacyChecked] = useState(false);
  const [refundPolicyChecked, setRefundPolicyChecked] = useState(false);
  const [agreeAll, setAgreeAllChecked] = useState(false);
  
  const totalAmount = selectedMenu?.price || 0;

   const [successModalOpen, setSuccessModalOpen] = useState(false);
  
  const couponDiscountAmount = selectedCoupon
    ? (selectedCoupon.discountType === 'percentage'
      ? Math.floor(totalAmount * selectedCoupon.discountValue / 100)
      : selectedCoupon.discountValue)
    : 0;
  
  const finalAmount = selectedCoupon 
    ? (selectedCoupon.discountType === 'percentage'
      ? totalAmount - (totalAmount * selectedCoupon.discountValue / 100)
      : totalAmount - selectedCoupon.discountValue) - usedPoints
    : totalAmount - usedPoints;

  const allChecked = termsChecked && privacyChecked && refundPolicyChecked;

  const reservationData: ReservationRequest = {
    stylist_id: stylistId,
    reservation_date: selectedDate,
    reservation_time: selectedTime,
    is_paid: false,
    requirements: requirements || '',
    service_menu_id: selectedMenu?.id || 0,
    salonId: salonId,
  };


  const paymentRequest: PaymentRequest = {
    price: finalAmount,
    pointUsage: usedPoints > 0 ? {
      usage_type: 'USE',
      price: usedPoints,
      content: '결제에 사용된 포인트',
    } : undefined,
    couponData: selectedCoupon ? {
      coupon_id: selectedCoupon.couponId,
      discount_amount: couponDiscountAmount,
    } : undefined,
    reservation: reservationData,
  };

  const googlePayRequest: GooglePayRequest = {
    apiVersion: 2,
    apiVersionMinor: 0,
    allowedPaymentMethods: [
      {
        type: 'CARD',
        parameters: {
          allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
          allowedCardNetworks: ['MASTERCARD', 'VISA'],
        },
        tokenizationSpecification: {
          type: 'PAYMENT_GATEWAY',
          parameters: {
            gateway: 'example',
            gatewayMerchantId: 'exampleGatewayMerchantId'
          }
        }
      },
    ],
    merchantInfo: {
      merchantName: 'Your Merchant Name',
      merchantId: 'exampleMerchantId',
    },
    transactionInfo: {
      totalPriceStatus: 'FINAL',
      totalPrice: finalAmount.toString(),
      currencyCode: 'KRW',
    }
  };
  
  console.log('reservationData:', JSON.stringify(googlePayRequest, null, 2));

  
  
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>, type: string) => {
    switch(type) {
      case 'terms':
        setTermsChecked(e.target.checked);
        break;
      case 'privacy':
        setPrivacyChecked(e.target.checked);
        break;
      case 'refundPolicy':
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

  const handleSelectCoupon = (coupon: Coupon) => {
    if (!coupon.isAvailable) return;
    setSelectedCoupon(coupon === selectedCoupon ? null : coupon);
  };
  const handlePointChange = (e) => {
    const value = parseInt(e.target.value, 10);
    
    if (isNaN(value)) {
      setUsedPoints(0);
      setPointError('');
      return;
    }
    
    if (value > userPoint) {
      setUsedPoints(userPoint);
      setPointError('사용 가능한 포인트를 초과했습니다.');
      return;
    }
    
  
    if (value % 10 !== 0) {
      setUsedPoints(value);
      setPointError('10단위로 입력해주세요.');
      return;
    }
    
    setUsedPoints(value);
    setPointError('');
  };

const handlePaymentSuccess = async (paymentData: any) => {
  try {
    
    let paymentMethod = '구글페이';
    let paymentToken = null;
    let transactionId = 'TEST_' + Date.now();
    
    
    if (paymentData && paymentData.paymentMethodData) {
      paymentToken = paymentData.paymentMethodData.tokenizationData?.token;
      
      if (paymentData.transactionId) {
        transactionId = paymentData.transactionId;
      }
    }
    
    
    const reservationData = {
      price: finalAmount,
      payment_method: paymentMethod,
      transaction_id: transactionId,
      payment_status: 'true',  
      payment_info: {
        discount_amount: couponDiscountAmount,
        point_used: usedPoints, 
        currency: 'KRW',
      },
      payment_token: paymentToken, 
      paymentRequest,
    };
    
    

   
    const config = {
      headers: {
        'Content-Type': 'application/json',
        // 필요하다면 인증 토큰 추가
        // 'Authorization': `Bearer ${authToken}`
      }
    };

    const response = await axios.post('/api/salon/reservation/complete', reservationData, config);

    if (response.status === 200) {

     setSuccessModalOpen(true);
  
    } else {
      alert('예약 처리 실패: ' + (response.data?.message || '알 수 없는 오류'));
    }
  } catch (error) {
    console.error('서버 요청 오류:', error);

    if (axios.isAxiosError(error) && error.response) {
      console.error('응답 상태:', error.response.status);
      console.error('응답 데이터:', error.response.data);
      alert(`서버 오류 (${error.response.status}): ${error.response.data?.message || '알 수 없는 오류'}`);
    } else {
      alert('서버 요청 중 오류가 발생했습니다.');
    }
  }
};

  // ===== 유틸리티 함수 =====

  // const handlePaymentSuccess = async (testPaymentData) => {
  //   try {
  //     // 결제 데이터와 예약 정보를 서버로 전달 (토큰 없이)
  //     const reservationData = {
  //       price: finalAmount,
  //       payment_method: '구글페이',
  //       transaction_id: testPaymentData.transactionId || ('TEST_' + Date.now()),
  //       payment_status: 'test', // 테스트 결제임을 표시
  //       payment_info: {
  //         discount_amount: couponDiscountAmount,
  //         point_used: usedPoints,
  //         currency: 'KRW',
  //       },
  //       // payment_token은 전송하지 않음
  //       paymentRequest,
  //     };
      
  //     console.log('테스트 예약 데이터:', JSON.stringify(reservationData, null, 2));
  
  //     const response = await axios.post('/api/salon/reservation/complete', reservationData);
  
  //     if (response.status === 200) {
  //       alert('테스트 예약이 완료되었습니다!');
  //       navigate('/reservation-success');
  //     } else {
  //       alert('예약 처리 실패: ' + (response.data?.message || '알 수 없는 오류'));
  //     }
  //   } catch (error) {
  //     console.error('서버 요청 오류:', error);
  //     // 오류 처리...
  //   }
  // };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}. ${String(date.getMonth() + 1).padStart(2, '0')}. ${String(date.getDate()).padStart(2, '0')}`;
  };

  const getDisabledMessage = (coupon: Coupon): string => {
    if (!coupon.isActive) return '이 쿠폰은 현재 비활성화 상태입니다.';
    if (coupon.minimumPurchase > totalAmount) return `최소 주문 금액(${coupon.minimumPurchase.toLocaleString()}원)을 충족하지 않습니다.`;
    
    const now = new Date();
    const start = new Date(coupon.startDate);
    const expiry = new Date(coupon.expiryDate);
    
    if (now < start) return '아직 사용 기간이 시작되지 않았습니다.';
    if (now > expiry) return '사용 기간이 만료되었습니다.';
    
    return '이미 사용한 쿠폰입니다.';
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
          axios.get<{ id: string, points: number }>(`/api/salon/points/available`)
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

  // 브라우저 확인
  useEffect(() => {
    const isSafari = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      return userAgent.indexOf('safari') !== -1 && userAgent.indexOf('chrome') === -1;
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
      <Box sx={{ maxWidth: 400, mx: 'auto', p: 2 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>Coupon</Typography>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>Point</Typography>
          <Typography sx={{ mb: 1 }}>사용 가능한 포인트: 로딩 중...</Typography>
          <TextField
            fullWidth
            variant="outlined"
            label="사용할 포인트 입력"
            disabled
          />
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          textAlign: 'center',
          p: 3
        }}
      >
        <Typography variant="h6" color="error">
          {error}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto'}}>
      {/* 쿠폰 섹션 */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
            Coupon
          </Typography>
          <Typography variant="caption" sx={{ color: '#757575', cursor: 'pointer' }}>
            View All &gt;
          </Typography>
        </Box>
        
        {coupons.length === 0 ? (
          <Typography>사용 가능한 쿠폰이 없습니다.</Typography>
        ) : (
          <Box sx={{ 
            maxHeight: 300, 
            overflow: 'auto', 
            scrollbarWidth: 'none',
            '&::-webkit-scrollbar': {
              display: 'none',
            }, 
          }}>
            {coupons.map((coupon) => (
              <Tooltip
                key={coupon.couponId}
                title={!coupon.isAvailable ? getDisabledMessage(coupon) : ""}
                placement="top"
              >
                <Box 
                  onClick={() => handleSelectCoupon(coupon)}
                  sx={{ 
                    display: 'flex', 
                    bgcolor: 'white', 
                    borderRadius: 2,
                    border: selectedCoupon?.couponId === coupon.couponId 
                      ? '5px solid #FFE500' 
                      : coupon.isAvailable 
                        ? '2px solid #FFE500' 
                        : '2px solid #e0e0e0',
                    overflow: 'hidden',
                    mb: 1.5,
                    cursor: coupon.isAvailable ? 'pointer' : 'default',
                    opacity: coupon.isAvailable ? 1 : 0.6,
                    position: 'relative',
                    '&:hover': {
                      boxShadow: coupon.isAvailable ? '0 2px 8px rgba(0,0,0,0.15)' : 'none'
                    },
                    '&::after': !coupon.isAvailable ? {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      background: 'repeating-linear-gradient(45deg, rgba(0,0,0,0.03), rgba(0,0,0,0.03) 10px, rgba(0,0,0,0.06) 10px, rgba(0,0,0,0.06) 20px)'
                    } : {}
                  }}
                >
                  {/* 왼쪽 할인 정보 영역 */}
                  <Box sx={{ 
                    width: 80, 
                    bgcolor: !coupon.isAvailable
                      ? '#f5f5f5'
                      : selectedCoupon?.couponId === coupon.couponId
                        ? '#FFE500'
                        : '#FFE500',  
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    py: 1.5,
                    zIndex: 1,
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      right: 0,
                      top: 0,
                      height: '100%',
                      borderRight: '2px dashed #eee'
                    }
                  }}>
                    <Typography variant="caption" sx={{ color: '#757575', fontWeight: 'bold' }}>
                      HAIR
                    </Typography>
                    {coupon.discountType === 'percentage' ? (
                      <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                        {coupon.discountValue}% off
                      </Typography>
                    ) : (
                      <>
                        <Typography variant="body2" sx={{ fontWeight: 'bold', textAlign: 'center' }}>
                          {coupon.discountValue.toLocaleString()} KRW
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#757575', fontSize: '10px' }}>
                          (USD {(coupon.discountValue / 1500).toFixed(2)})
                        </Typography>
                      </>
                    )}
                  </Box>
                  
                  {/* 오른쪽 쿠폰 정보 영역 */}
                  <Box sx={{ flex: 1, p: 1.5, display: 'flex', justifyContent: 'space-between', zIndex: 1 }}>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                        {coupon.couponName}
                      </Typography>
                      <Typography variant="caption" sx={{ display: 'block', color: '#757575' }}>
                        Expires on {formatDate(coupon.expiryDate)}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#757575' }}>
                        {coupon.minimumPurchase > 0 
                          ? `Valid for orders above ${coupon.minimumPurchase.toLocaleString()} KRW` 
                          : 'No minimum purchase required'}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Tooltip>
            ))}
          </Box>
        )}
      </Box>

      <Divider sx={{ marginY: 5, borderColor: 'grey.500', borderWidth: 2 }} />
      
      {/* 포인트 섹션 */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{fontWeight: 'bold'}} gutterBottom>Point</Typography>
        <Typography sx={{ mb: 2 }}>보유 포인트: {userPoint ? userPoint.toLocaleString() : 0}포인트</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            fullWidth
            label="사용할 포인트"
            type="text" 
            value={usedPoints === 0 ? '' : usedPoints}
            onChange={(e) => {
              const value = e.target.value.replace(/[^0-9]/g, '');
              if (value === '') {
                setUsedPoints(0);
                setPointError('');
                return;
              }
              const numValue = parseInt(value, 10);
              handlePointChange({ target: { value: numValue } });
            }}
            error={Boolean(pointError)}
            helperText={pointError || "10단위로 입력해주세요."}
            InputLabelProps={{
              shrink: true,
            }}
            inputProps={{
              inputMode: 'numeric',
              pattern: '[0-9]*',
            }}
            variant="outlined"
            sx={{
              width: '80%'
            }}
          />
          <Button 
            variant="contained"
            onClick={() => {
              setUsedPoints(0);
              setPointError('');
            }}
            disabled={usedPoints === 0}
            sx={{ height: '56px' }}
          >
            초기화
          </Button>
        </Box>
        <Typography sx={{ mb: 2 }}>남은 포인트: {userPoint ? (userPoint - usedPoints).toLocaleString() : 0}포인트</Typography>
      </Box>

      <Divider sx={{ marginY: 5, borderColor: 'grey.500', borderWidth: 2 }} />

      {/* 예약 정보 요약 */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" gutterBottom sx={{fontWeight: 'bold'}}>Reservation information</Typography>
        <Box sx={{ backgroundColor: '#FDF6F3', borderRadius: 5, p: 3 }}>
          {[
            ['스타일리스트 이름', stylistName],
            ['선택 날짜', selectedDate],
            ['선택 시간', selectedTime],
            ['서비스 타입', selectedType],
            ['서비스 메뉴', selectedMenu?.serviceName],
            ['가격', `${selectedMenu?.price?.toLocaleString() || 0}KRW`],
          ].map(([label, value], idx) => (
            <Box key={idx} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography>{label}:</Typography>
              <Typography>{value}</Typography>
            </Box>
          ))}
        </Box>
      </Box>
      
      <Divider sx={{ marginY: 5, borderColor: 'grey.500', borderWidth: 2 }} />   

      {/* 결제 내역 섹션 */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" gutterBottom sx={{fontWeight: 'bold'}}>Payment history</Typography>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography>{selectedMenu?.serviceName}:</Typography>
          <Typography>{totalAmount.toLocaleString()}KRW</Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography>쿠폰 할인:</Typography>
          <Typography color="error">
            {selectedCoupon 
              ? (selectedCoupon.discountType === 'percentage'
                ? `-${(totalAmount * selectedCoupon.discountValue / 100).toLocaleString()}원 (${selectedCoupon.discountValue}%)`
                : `-${selectedCoupon.discountValue.toLocaleString()}원`)
              : "0원"}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography>포인트 사용:</Typography>
          <Typography color="error">{usedPoints > 0 ? `-${usedPoints.toLocaleString()}P` : "0P"}</Typography>
        </Box>
        <Divider sx={{ my: 1, borderWidth: 2 }} />
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="h6">Total:</Typography>
          <Typography variant="h6" color="error">
            {Math.max(0, finalAmount).toLocaleString()}KRW
          </Typography>
        </Box>
        <Typography variant="caption" sx={{ display: 'block', textAlign: 'right', color: '#757575', mt: 0.5 }}>
          *10% VAT Included
        </Typography>
      </Box>

      <Divider sx={{ marginY: 5, borderColor: 'grey.500', borderWidth: 2 }} />

      {/* 결제 방법 선택 */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
          Payment Method
        </Typography>

        <Grid container spacing={2} justifyContent="center">
          <Grid item>
            <Button
              variant="contained"
              onClick={() => setSelectedPayment('google')}
              sx={{
                width: '200px',
                height: '50px',
                backgroundColor: selectedPayment === 'google' ? '#333' : '#fff',
                color: '#fff',
                fontSize: '16px',
                fontWeight: 'bold',
                borderRadius: '4px',
                padding: '0px', 
                display: 'flex',
                justifyContent: 'center',
                boxShadow: 'none', 
                border: '1px solid #000',
                alignItems: 'center',
                textTransform: 'none',
                '&:hover': {
                  backgroundColor: '#333',
                  '& img': {
                    filter: 'brightness(2)',
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
                  filter: selectedPayment === 'google' ? 'brightness(2)' : 'none'
                }}
              />
            </Button>
          </Grid>

          <Grid item>
            <Button
              variant="contained"
              disabled={!isSafariBrowser}
              onClick={() => setSelectedPayment('apple')}
              sx={{
                width: '200px',
                height: '50px',
                backgroundColor: selectedPayment === 'apple' ? '#333' : '#fff',
                color: '#fff',
                fontSize: '16px',
                fontWeight: 'bold',
                borderRadius: '4px',
                padding: '0px', 
                display: 'flex',
                justifyContent: 'center',
                boxShadow: 'none', 
                border: '1px solid #000',
                alignItems: 'center',
                textTransform: 'none',
                '&:hover': {
                  backgroundColor: '#333',
                  '& img': {
                    filter: 'brightness(2)',
                  },
                },
              }}
            >
              <img
                src={applePay}
                alt="Apple Pay"
                style={{ 
                  width: 'auto',
                  height: '100%',
                  maxWidth: '100%',
                  filter: selectedPayment === 'apple' ? 'brightness(2)' : 'none'
                }}
              />
            </Button> 
            {!isSafariBrowser && (
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5, textAlign: 'center' }}>
                Safari 브라우저에서만 사용 가능합니다.
              </Typography>
            )}
          </Grid>
        </Grid>
        
        <Divider sx={{ marginY: 5, borderColor: 'grey.500', borderWidth: 2 }} />   

        {/* 요청사항 */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom sx={{fontWeight: 'bold', mb: 5}}>Requirements</Typography>
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
              '& .MuiOutlinedInput-root': {
                '&:hover fieldset': {
                  borderColor: '#FDE4D0', 
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#FDE4D0',
                },
              },
              '& label': {
                color: '#999', 
              },
              '& label.Mui-focused': {
                color: '#FDC7BF', 
              },
              '&:hover label': {
                color: '#FDC7BF', 
              },
            }}
          />
        </Box>

        {/* 약관 동의 섹션 */}
        <Box sx={{ mb: 3 }}>
          <FormControlLabel
            control={<Checkbox checked={termsChecked} onChange={(e) => handleCheckboxChange(e, 'terms')} />}
            label="I agree to the Terms and Conditions"
          />
          <FormControlLabel
            control={<Checkbox checked={privacyChecked} onChange={(e) => handleCheckboxChange(e, 'privacy')} />}
            label="I have read and agree to the Privacy Policy"
          />
          <FormControlLabel
            control={<Checkbox checked={refundPolicyChecked} onChange={(e) => handleCheckboxChange(e, 'refundPolicy')} />}
            label="I agree to the Cancellation and Refund Policy"
          />
          
          <Box sx={{ mt: 1 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={agreeAll}
                  onChange={handleAgreeAllChange}
                />
              }
              label="전체 동의"
            />
          </Box>
        </Box>

        {/* 결제 버튼 영역 */}
        {selectedPayment && allChecked && (
          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
            {selectedPayment === 'google' && (
              <GooglePayButton
              environment="TEST"
              paymentRequest={googlePayRequest}
              onLoadPaymentData={(paymentData) => {
                console.log('결제 완료 데이터:', paymentData);
                // 전체 결제 데이터 구조 확인
                  console.log('전체 결제 데이터:', JSON.stringify(paymentData, null, 2));
                  
                  // 토큰 관련 부분 확인
                  console.log('결제 방식 데이터:', paymentData.paymentMethodData);
                  console.log('토큰화 데이터:', paymentData.paymentMethodData?.tokenizationData);
                  console.log('토큰:', paymentData.paymentMethodData?.tokenizationData?.token);
                handlePaymentSuccess(paymentData);
              }}
              buttonType="pay"
              buttonSizeMode="fill"
              buttonColor="black"
              style={{ width: '300px', height: '50px' }}
            />
            )}
            
            {selectedPayment === 'apple' && isSafariBrowser && (
              <ApplePayButton
                onClick={() => {
                  console.log('애플 페이 결제 시작');
                  
                  const mockPaymentData = {
                    totalPrice: finalAmount.toString(),
                    paymentMethod: 'apple',
                    transactionId: `apple-${Date.now()}`,
                  };
                  
                  setTimeout(() => {
                    handlePaymentSuccess(mockPaymentData);
                  }, 2000);
                }}
                buttonType="plain"
                buttonColor="black"
                style={{ width: '300px', height: '50px' }}
              />
            )}
          </Box>
        )}
        
        {!(selectedPayment && allChecked) && (
          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              {!selectedPayment 
                ? '결제 수단을 선택해주세요.' 
                : !allChecked 
                  ? '모든 약관에 동의해주세요.' 
                  : '결제를 진행해주세요.'}
            </Typography>
          </Box>
        )}


      <Dialog
        open={successModalOpen}
        onClose={() => {
          setSuccessModalOpen(false);
          navigate('/myPage/reservation');
        }}
        aria-labelledby="payment-success-dialog-title"
      >
        <DialogTitle id="payment-success-dialog-title" sx={{ 
          backgroundColor: '#FDF6F3', 
          color: '#333',
          fontWeight: 'bold',
          textAlign: 'center'
        }}>
          예약 완료
        </DialogTitle>
        <DialogContent sx={{ padding: 4, minWidth: '300px' }}>
          <DialogContentText sx={{ textAlign: 'center', mb: 2 }}>
            예약이 성공적으로 완료되었습니다!
            Your reservation has been successfully completed!
          </DialogContentText>
          <DialogContentText sx={{ textAlign: 'center', fontSize: '14px', color: '#666' }}>
            예약 정보는 마이페이지에서 확인하실 수 있습니다.
            You can check the reservation information on my page.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ padding: 2, justifyContent: 'center' }}>
          <Button 
            onClick={() => {
              setSuccessModalOpen(false);
              navigate('/myPage/reservation');
            }}
            variant="contained"
            sx={{
              backgroundColor: '#000',
              color: '#fff',
              '&:hover': {
                backgroundColor: '#333',
              },
              width: '80%'
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