// // 서버에 보낼 타입스크립트 정의

// // 예약정보
// export interface ReservationRequest {
//     stylistId: number;           
//     reservationDate: string;     
//     reservationTime: string;     
//     isPaid: boolean;             
//     requirements: string;         
//     serviceMenuId: number;     
//     salonId: string;
//   }
  
//   // 포인트정보
//   export type UsageType = 'USE' | 'SAVE';
  
//   export interface PointUsageRequest {
//     usageType: UsageType;
//     price: number;
//     content: string;
//   }
  
//   // 선택한 쿠폰 정보
//   export interface CouponUsageRequest {
//     couponId: number;
//     discountAmount: number;
//   }
  
//   // 결제 정보를 위한 타입 정의
//   export interface PaymentInfo {
//     price: number;                        
//     paymentMethod: 'google' | 'apple' | 'credit_card' | 'other';  
//     paymentStatus: 'pending' | 'completed' | 'failed' | 'cancelled'; 
//     transactionId: string;              
//   }
  
//   // 결제 요청 타입 정의
//   export interface PaymentRequest {
//     price: number;  
//     pointUsage?: PointUsageRequest;  
//     couponDate?: CouponUsageRequest; 
//     reservation?: ReservationRequest; 
//   }
  
//  // Google Pay 결제 시스템 요청 타입 정의
// export interface AllowedPaymentMethod {
//     type: 'CARD';
//     parameters: {
//       allowedAuthMethods: ('PAN_ONLY' | 'CRYPTOGRAM_3DS')[];
//       allowedCardNetworks: ('MASTERCARD' | 'VISA')[];
//     };
//     tokenizationSpecification: {
//       type: 'PAYMENT_GATEWAY';
//       parameters: {
//         gateway: string;
//         gatewayMerchantId: string;
//       };
//     };
//   }
  
//   export interface MerchantInfo {
//     merchantName: string;
//     merchantId: string;
//   }
  
//   export interface TransactionInfo {
//     totalPriceStatus: 'FINAL';
//     totalPrice: string;
//     currencyCode: string;
//   }
  
//   export interface PaymentOptions {
//     pointUsage?: PointUsageRequest;
//     couponDate?: CouponUsageRequest;
//   }
  
//   export interface GooglePayRequest {
//     apiVersion: number;
//     apiVersionMinor: number;
//     allowedPaymentMethods: AllowedPaymentMethod[];
//     merchantInfo: MerchantInfo;
//     transactionInfo: TransactionInfo;
//     paymentOptions?: PaymentOptions;
//     reservation?: ReservationRequest; // 예약 정보를 선택적으로 변경
//   }