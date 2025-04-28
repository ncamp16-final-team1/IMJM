import axios from 'axios';

export type UserReservations = {
    salonId: string;
    salonName: string;         
    salonAddress: string;     
    salonPhotoUrl: string;     
    salonScore: number;     
    reviewCount: number;       
    reservationDate: string;   
    reservationTime: string;   
    reservationServiceName: string;
    price: number;     
    isReviewed: boolean; 
    reservationId: number;    
    reviewId: number;
    stylistName: string;   
};

export const getUserReservations = async (): Promise<UserReservations[]> => {
    try {
        const response = await axios.get('/api/myPages/reservations');
        
        if (response.status === 200 && Array.isArray(response.data)) {
            return response.data;
        } else {
            throw new Error('서버에서 올바른 데이터를 반환하지 않았습니다.');
        }
        
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            console.error('서버 응답 오류:', error.response.data);
        } else {
            console.error('예약 목록 조회 실패:', error);
        }
        throw error;
    }
};