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
  Paper,
  Grid
} from '@mui/material';

import { useLocation, useNavigate } from 'react-router-dom';
import GooglePayButton from '@google-pay/button-react';



// 쿠폰 인터페이스
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

function PaymentDetails() {
  // 상태 관리
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [usedPoints, setUsedPoints] = useState<number>(0);
  const [isSafari, setIsSafari] = useState<boolean>(false);
  const [isIOS, setIsIOS] = useState<boolean>(false);
  const navigate = useNavigate();
  
  // 브라우저 및 OS 확인
  useEffect(() => {
    // Safari 브라우저 확인
    const isSafariBrowser = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    
    // iOS 디바이스 확인
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
                        (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    
    setIsSafari(isSafariBrowser);
    setIsIOS(isIOSDevice);
    
    console.log("브라우저 환경:", { 
      isSafari: isSafariBrowser, 
      isIOS: isIOSDevice, 
      userAgent: navigator.userAgent 
    });
  }, []);
  
  // 로케이션으로 가져온거 관리
  const location = useLocation();
  const {
    stylistId,
    stylistName,
    selectedDate,
    selectedTime,
    selectedType,
    userId,
    selectedMenu,
    salonId
  } = location.state || {}; 

  const totalAmount = selectedMenu?.price || 0;

  // 최종 금액 계산
  const finalAmount = selectedCoupon 
  ? (selectedCoupon.discountType === 'percentage'
    ? totalAmount - (totalAmount * selectedCoupon.discountValue / 100)
    : totalAmount - selectedCoupon.discountValue) - usedPoints
  : totalAmount - usedPoints;

  const handleSelectCoupon = (coupon: Coupon) => {
    if (!coupon.isAvailable) return;
    
    setSelectedCoupon(coupon === selectedCoupon ? null : coupon);
  };
  
  // 결제 진행 함수
  const handlePayment = (paymentMethod: string) => {
    // 여기에 실제 결제 처리 로직 추가
    // 예약 완료 페이지 또는 결제 처리 페이지로 이동
    // navigate('/payment-complete', { state: { paymentMethod, amount: finalAmount, ... } });
    
    // 예시: 알림만 표시
    alert(`${paymentMethod}로 ${Math.max(0, finalAmount).toLocaleString()}원 결제가 완료되었습니다.`);
  };
  
  useEffect(() => {
    if (!salonId || !totalAmount) return;
  
    const fetchCoupons = async () => {
      setLoading(true);
      try {
        const response = await axios.get<Coupon[]>(`/api/salon/reservation/coupons`, {
          params: {
            salonId: salonId,
            totalAmount: totalAmount,
          },
        });
        
        // 응답 데이터 직접 사용
        setCoupons(response.data);
      } catch (err) {
        setError('쿠폰을 불러오는 데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };
  
    fetchCoupons();
  }, [salonId, totalAmount]);

  const handlePointChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 0;
    setUsedPoints(Math.min(value, 5000)); // 예시로 최대 5000 포인트로 제한
  };

  // 날짜 포맷팅 함수
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}. ${String(date.getMonth() + 1).padStart(2, '0')}. ${String(date.getDate()).padStart(2, '0')}`;
  };

  // 비활성화된 쿠폰 메시지 반환 함수
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

  // 카카오페이 버튼
  const KakaoPayButton = () => (
    <Grid item xs={12} sm={6}>
      <Paper 
        elevation={1}
        onClick={() => handlePayment('Kakao Pay')}
        sx={{ 
          width: '100%',
          px: 3, py: 1.5,
          border: '1px solid #FFEB00',
          borderRadius: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          height: '50px',
          transition: 'all 0.2s',
          backgroundColor: '#FFEB00',
          '&:hover': { 
            boxShadow: 3,
            opacity: 0.9,
            transform: 'translateY(-2px)'
          }
        }}
      >
        <Box sx={{ 
          color: '#000', 
          fontWeight: 'bold',
          fontSize: '1rem',
          display: 'flex',
          alignItems: 'center',
        }}>
          <span style={{ color: '#3C1E1E' }}>kakao</span>&nbsp;pay
        </Box>
      </Paper>
    </Grid>
  );

  // 매장결제 버튼
  const InStorePaymentButton = () => (
    <Grid item xs={12} sm={6}>
      <Paper 
        elevation={1}
        onClick={() => handlePayment('매장 결제')}
        sx={{ 
          width: '100%',
          px: 3, py: 1.5,
          border: '1px solid #e0e0e0',
          borderRadius: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          height: '50px',
          transition: 'all 0.2s',
          '&:hover': { 
            boxShadow: 3,
            borderColor: '#9E9E9E',
            transform: 'translateY(-2px)'
          }
        }}
      >
        <Typography sx={{ fontSize: '0.9rem' }}>
          payment at the store
        </Typography>
      </Paper>
    </Grid>
  );

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto'}}>
      {/* 쿠폰 섹션 */}
      <Box sx={{  mb: 3 }}>
        {/* 헤더 영역 */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            쿠폰
          </Typography>
          <Typography variant="caption" sx={{ color: '#757575', cursor: 'pointer' }}>
            View All &gt; {/* -- 마이쿠폰페이지로 이동 -- */}
          </Typography>
        </Box>
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Typography color="error">{error}</Typography>
        ) : coupons.length === 0 ? (
          <Typography>사용 가능한 쿠폰이 없습니다.</Typography>
        ) : (
          <Box sx={{ maxHeight: 300, overflow: 'auto', scrollbarWidth: 'none', // Firefox용
            '&::-webkit-scrollbar': {
              display: 'none', // Chrome, Safari, Edge용
            }, }}>
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
                      ? '#f5f5f5' // 비활성화된 쿠폰은 회색
                      : selectedCoupon?.couponId === coupon.couponId
                        ? '#FFE500' // 선택된 쿠폰은 연보라색
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
      <Box sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>포인트</Typography>
        <Typography sx={{ mb: 2 }}>보유 포인트: 5,000 포인트</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            fullWidth
            label="사용할 포인트"
            type="number"
            value={usedPoints || ''}
            onChange={handlePointChange}
            InputLabelProps={{
              shrink: true,
            }}
            inputProps={{
              min: 0,
              max: 5000,
            }}
            variant="outlined"
          />
          <Button 
            variant="contained"
            onClick={() => setUsedPoints(0)}
            disabled={usedPoints === 0}
          >
            초기화
          </Button>
        </Box>
      </Box>

      <Divider sx={{ marginY: 5, borderColor: 'grey.500', borderWidth: 2 }} />    

      {/* 예약 정보 요약 */}
      <Box sx={{ p: 2, mb: 3 }}>
        <Typography variant="h5" gutterBottom>예약 정보</Typography>
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
      <Box sx={{ mb: 3, p: 2 }}>
        <Typography variant="h6" gutterBottom>결제 내역</Typography>
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
        
        <Grid 
          container 
          spacing={2} 
          justifyContent="center"
        >
          {/* Google Pay 버튼 */}
          <Grid item xs={12} sm={6}>
            <Box sx={{ height: 50, display: 'flex', justifyContent: 'center' }}>
              <GooglePayButton
                environment="TEST"
                buttonColor="black"
                buttonType="pay"
                buttonSizeMode="fill"
                paymentRequest={{
                  apiVersion: 2,
                  apiVersionMinor: 0,
                  allowedPaymentMethods: [
                    {
                      type: 'CARD',
                      parameters: {
                        allowedAuthMethods: ['PAN_ONLY', 'CRYPTOGRAM_3DS'],
                        allowedCardNetworks: ['VISA', 'MASTERCARD'],
                      },
                      tokenizationSpecification: {
                        type: 'PAYMENT_GATEWAY',
                        parameters: {
                          gateway: 'example',
                          gatewayMerchantId: 'exampleMerchantId',
                        },
                      },
                    },
                  ],
                  merchantInfo: {
                    merchantId: '12345678901234567890',
                    merchantName: 'Example Merchant',
                  },
                  transactionInfo: {
                    totalPriceStatus: 'FINAL',
                    totalPriceLabel: 'Total',
                    totalPrice: (finalAmount / 1500).toFixed(2), // KRW를 USD로 대략 변환
                    currencyCode: 'USD',
                    countryCode: 'US',
                  },
                }}
                onLoadPaymentData={(paymentData) => {
                  console.log('Google Pay 결제 데이터:', paymentData);
                  handlePayment('Google Pay');
                }}
                onError={(error) => {
                  console.error('Google Pay 오류:', error);
                }}
              />
            </Box>
          </Grid>

          {/* Apple Pay 버튼 - 사파리 브라우저와 iOS 디바이스에서만 표시 */}
          {(isSafari || isIOS) && (
            <Grid item xs={12} sm={6}>
              <Paper 
                elevation={1}
                onClick={() => handlePayment('Apple Pay')}
                sx={{ 
                  width: '200px',
                  border: '1px solid #000',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  height: '50px',
                  transition: 'all 0.2s',
                  backgroundColor: '#000',
                  '&:hover': { 
                    opacity: 0.9,
                    transform: 'translateY(-2px)'
                  }
                }}
              >
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  color: 'white',
                  fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
                  fontSize: '16px',
                  fontWeight: '500'
                }}>
                  <svg height="24" width="40" viewBox="0 0 40 24" xmlns="http://www.w3.org/2000/svg">

                  </svg>
                </Box>
              </Paper>
            </Grid>
          )}

        </Grid>

        {/* 브라우저 환경 안내 메시지 */}
        {!isSafari && !isIOS && (
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary">
              Apple Pay는 Safari 브라우저 또는 iOS 디바이스에서만 사용 가능합니다.
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
}

export default PaymentDetails;