import axios from 'axios';
import { StylistSchedule } from '../../pages/HairSalon/ReservationStylistSchedule';


export async function getStylistSchedule(stylistId: string | null): Promise<StylistSchedule> {
  if (!stylistId) throw new Error("스타일리스트 ID 없음");

  try {
    const response = await axios.get(`/api/hairsalon/reservation/${stylistId}`);
    return response.data; // 단일 객체라고 가정
  } catch (error) {
    console.error('Error fetching stylist schedule:', error);
    throw error;
  }
}