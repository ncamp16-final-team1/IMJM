import axios from 'axios';

export type UserReservations = {
    salonName: string;         
    salonAddress: string;     
    salonPhotoUrl: string;     
    salonScore: number;     
    reviewCount: number;       
    reservationDate: string;   
    reservationTime: string;   
    reservationServiceName: string;
    price: number;     
    reviewed: boolean; 
    reservationId: number;    
    reviewId: number;   
};

export const getUserReservations = async (): Promise<UserReservations[]> => {
    try {
        const response = await axios.get('/api/myPages/reservations');
        return response.data;
    } catch (error) {
        console.error('예약 목록 조회 실패:', error);
        throw error;
    }
};