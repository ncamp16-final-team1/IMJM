import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getStylistsBySalonId } from '../../services/reservation/getStylistsBySalonId';
import LoginDialog from '../../components/common/LonginDialog';
import axios from 'axios';
import {
  Box,
  Typography,
  Avatar
} from '@mui/material';

import { useDispatch } from 'react-redux';
import { setReservationInfo } from '../../components/features/reservation/reservationSlice';

export interface Stylist {
  salonId: string;
  stylistId: number;
  name: string;
  holidayMask: number;
  introduction: string;
  profile: string;
}



const Stylists = () => {
  const dispatch = useDispatch(); // Redux dispatch 추가
  const [stylists, setStylists] = useState<Stylist[]>([]);
  const { salonId } = useParams<{ salonId: string }>();
  const navigate = useNavigate();
  const [openLoginDialog, setOpenLoginDialog] = useState<boolean>(false);
  const [selectedStylistId, setSelectedStylistId] = useState<number | null>(null);

  // 로그인 상태 확인 함수
  const checkLoginStatus = async (): Promise<boolean> => {
    // 개발 환경에서는 항상 로그인된 상태 반환
    // if (process.env.NODE_ENV === 'development') {
    //   return true;
    // }
    try {
      const res = await axios.get('/api/user/check-login');
      return res.status === 200;
    } catch (error) {
      console.error("로그인 확인 실패:", error);
      return false;
    }
  };
  // const checkLoginStatus = (): boolean => {
  //   // 로컬 스토리지에서 유저 아이디를 확인
  //   const userId = localStorage.getItem('userId');
  
  //   // 유저 아이디가 있으면 로그인 상태로 간주
  //   if (userId) {
  //     return true;
  //   }
  
  //   // 없으면 로그인되지 않은 상태
  //   return false;
  // };

  // 예약 버튼 클릭 핸들러
  const handleReservationClick = async (stylistId: number) => {
    // 선택한 스타일리스트 ID 저장
    const selectedStylist = stylists.find(s => s.stylistId === stylistId);
    // 로그인 상태 확인
    const isLoggedIn = await checkLoginStatus();
    
    if (isLoggedIn) {
      // Redux에 salonId와 stylistId 저장
      dispatch(setReservationInfo({
        salonId: salonId || '', // URL의 salonId 저장
        stylistId: stylistId,
        selectedDate: '',
        selectedTime: '',
        selectedType: '',
        userId: '',
        selectedMenu: null,
        stylistName: selectedStylist?.name || ''
      }));

      // 예약 페이지로 이동
      navigate(`/salon/${salonId}/reservation/${stylistId}`);
    } else {
      // 로그인 되어 있지 않으면 로그인 다이얼로그 표시
      setOpenLoginDialog(true);
    }
  };

  // 로그인 페이지로 이동
  const handleGoToLogin = () => {
    navigate('/login', { 
      state: { from: `/salon/reservation/${selectedStylistId}` } 
    });
  };

  // 로그인 다이얼로그 닫기
  const handleCloseLoginDialog = () => {
    setOpenLoginDialog(false);
  };

  useEffect(() => {
    if (!salonId) {
      console.error("salonId가 없습니다.");
      return;
    }

    getStylistsBySalonId(salonId)
      .then(setStylists)
      .catch((error) => console.error('스타일리스트 가져오기 실패:', error));
  }, [salonId]);

  return (
    <Box sx={{ px: 4, py: 2 }}>
      <Typography variant="h4" gutterBottom sx={{ borderBottom: '3px solid #f5f5f5', pb: 2 }}>
        Stylist
      </Typography>

      {stylists.length > 0 ? (
        stylists.map((stylist) => (
          <Box
            key={stylist.stylistId}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '2px solid #f5f5f5',
              py: 2,
              flexWrap: 'wrap',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',  flex: 1 }}>
              <Box>
                <Typography variant="h6" sx={{ mb: 1 }}>
                  {stylist.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {stylist.introduction ? stylist.introduction.split('.')[0] : '헤어 디자이너'}
                </Typography>

                <Box sx={{ mt: 2 }}>
                    <Box 
                        component="button"
                        onClick={() => handleReservationClick(stylist.stylistId)}
                        sx={{
                        display: 'inline-block',
                        px: 2,
                        py: 1,
                        borderRadius: '20px',
                        backgroundColor: '#FDF6F3',
                        border: '2px solid #FDC7BF',
                        color: '#F06292',
                        textDecoration: 'none',
                        textAlign: 'center',
                        cursor: 'pointer',
                        '&:hover': {
                            backgroundColor: '#fdeae7',
                            borderColor: '#FDC7BF',
                        },
                        }}
                    >
                        Reservation
                    </Box>
                </Box>
            </Box>

              <Avatar
                src={stylist.profile}
                alt={stylist.name}
                sx={{ width: 100, height: 100, mr: 2 }}
              />
            </Box>
          </Box>
        ))
      ) : (
        <Typography variant="body1" sx={{ mt: 4 }}>
          등록된 스타일리스트가 없습니다.
        </Typography>
      )}

      {/* 로그인 필요 다이얼로그 */}
      <LoginDialog
        open={openLoginDialog}
        onClose={handleCloseLoginDialog}
        onLogin={handleGoToLogin}
        message="예약을 하기 위해서는 로그인이 필요합니다."
        />
    </Box>
  );
};

export default Stylists;