// 서버에 보낼 타입스크립트 정의

// 예약정보
export interface ReservationRequest {
    stylist_id: number;           // 스타일리스트 id
    reservation_date: string;     // 예약 날짜
    reservation_time: string;     // 예약 시간
    is_paid: boolean;             // 항상 false -> true
    requirements: string;         // 요청사항 (null 될 수 있음)
    service_menu_id: number;     // 서비스 메뉴 id
    salonId: string;
  }
  
  // 포인트정보
  export type UsageType = 'USE' | 'SAVE';
  
  export interface PointUsageRequest {
    usage_type: UsageType;
    price: number;
    content: string;
  }
  
  // 선택한 쿠폰 정보
  export interface CouponUsageRequest {
    coupon_id: number;
    discount_amount: number;
  }
  
  // 결제 정보를 위한 타입 정의
  export interface PaymentInfo {
    price: number;                        // 결제 가격
    payment_method: 'google' | 'apple' | 'credit_card' | 'other';  // 결제 수단
    payment_status: 'pending' | 'completed' | 'failed' | 'cancelled'; // 결제 상태
    transaction_id: string;               // 고유 거래 ID
  }
  
  // 결제 요청 타입 정의
  export interface PaymentRequest {
    price: number;  // 최종 결제 금액
    pointUsage?: PointUsageRequest;  // 포인트 사용 여부
    couponDate?: CouponUsageRequest; // 쿠폰 사용 여부
    reservation?: ReservationRequest; // 예약 정보
  }
  
 // Google Pay 결제 시스템 요청 타입 정의
export interface AllowedPaymentMethod {
    type: 'CARD';
    parameters: {
      allowedAuthMethods: ('PAN_ONLY' | 'CRYPTOGRAM_3DS')[];
      allowedCardNetworks: ('MASTERCARD' | 'VISA')[];
    };
    tokenizationSpecification: {
      type: 'PAYMENT_GATEWAY';
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
    totalPriceStatus: 'FINAL';
    totalPrice: string;
    currencyCode: string;
  }
  
  export interface PaymentOptions {
    pointUsage?: PointUsageRequest;
    couponDate?: CouponUsageRequest;
  }
  
  export interface GooglePayRequest {
    apiVersion: number;
    apiVersionMinor: number;
    allowedPaymentMethods: AllowedPaymentMethod[];
    merchantInfo: MerchantInfo;
    transactionInfo: TransactionInfo;
    paymentOptions?: PaymentOptions;
    reservation?: ReservationRequest; // 예약 정보를 선택적으로 변경
  }