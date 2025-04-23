import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { Box, Typography, Avatar } from '@mui/material';
import { getStylistsBySalonId } from '../../services/reservation/getStylistsBySalonId';
import LoginDialog from '../../components/common/LonginDialog';

export interface Stylist {
  salonId: string;
  stylistId: number;
  name: string;
  holidayMask: number;
  introduction: string;
  profile: string;
}

const Stylists = () => {
  const navigate = useNavigate();
  const { salonId } = useParams<{ salonId: string }>();

  const [stylists, setStylists] = useState<Stylist[]>([]);
  const [openLoginDialog, setOpenLoginDialog] = useState(false);
  const [selectedStylistId, setSelectedStylistId] = useState<number | null>(null);

  // 로그인 상태 확인
  const checkLoginStatus = async (): Promise<boolean> => {
    try {
      const response = await axios.get('/api/user/check-login');
      return response.status === 200;
    } catch (error) {
      console.error('로그인 상태 확인 실패:', error);
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

  // 예약 클릭 핸들러
  const handleReservationClick = async (stylistId: number) => {
    const isLoggedIn = await checkLoginStatus();
    const selectedStylist = stylists.find((s) => s.stylistId === stylistId);

    if (!selectedStylist) return;

    setSelectedStylistId(stylistId);

    if (isLoggedIn) {
      navigate(`/salon/${salonId}/reservation/${stylistId}`, {
        state: {
          salonId: salonId || '',
          stylistId: selectedStylist.stylistId,
          stylistName: selectedStylist.name,
          selectedDate: '',
          selectedTime: '',
          selectedType: '',
          userId: '',
          selectedMenu: null,
        }
      });
    } else {
      setOpenLoginDialog(true);
    }
  };

  const handleGoToLogin = () => {
    if (!selectedStylistId) return;
    navigate('/login', {
      state: { from: `/salon/${salonId}/reservation/${selectedStylistId}` },
    });
  };

  const handleCloseLoginDialog = () => {
    setOpenLoginDialog(false);
  };

  useEffect(() => {
    if (!salonId) {
      console.error('salonId가 존재하지 않습니다.');
      return;
    }

    getStylistsBySalonId(salonId)
      .then(setStylists)
      .catch((error) => console.error('스타일리스트 조회 실패:', error));
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
            <Box sx={{ display: 'flex', alignItems: 'center', flex: 1, justifyContent: 'space-between' }}>
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
                      px: 2,
                      py: 1,
                      borderRadius: '20px',
                      backgroundColor: '#FDF6F3',
                      border: '2px solid #FDC7BF',
                      color: '#F06292',
                      cursor: 'pointer',
                      '&:hover': {
                        backgroundColor: '#fdeae7',
                      },
                    }}
                  >
                    Reservation
                  </Box>
                </Box>
              </Box>

              <Avatar src={stylist.profile} alt={stylist.name} sx={{ width: 100, height: 100, mr: 2 }} />
            </Box>
          </Box>
        ))
      ) : (
        <Typography variant="body1" sx={{ mt: 4 }}>
          등록된 스타일리스트가 없습니다.
        </Typography>
      )}

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
