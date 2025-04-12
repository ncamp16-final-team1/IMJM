import axios from 'axios';
import { Stylist } from '../../pages/HairSalon/Stylists';

export async function getStylistsBySalonId(salonId: string | null): Promise<Stylist[]> {
  if (!salonId) return [];

  try {
    const response = await axios.get(`/api/hairsalon/stylists/${salonId}`);
    return response.data; // 서버에서 배열 형식으로 응답이 오면 그대로 사용
  } catch (error) {
    console.error('스타일리스트 데이터를 불러오는 데 실패했습니다:', error);
    return []; // 데이터 로딩 실패 시 빈 배열 반환
  }
}