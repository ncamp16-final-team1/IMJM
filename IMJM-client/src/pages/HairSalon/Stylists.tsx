import { useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getStylistsBySalonId } from '../../services/reservation/getStylistsBySalonId';
import {
  Box,
  Typography,
  Avatar,
} from '@mui/material';

export interface Stylist {
  salonId: string;
  stylistId: number;
  name: string;
  holidayMask: number;
  introduction: string;
  profile: string;
}

const Stylists = () => {
  const [stylists, setStylists] = useState<Stylist[]>([]);
  const { salonId } = useParams<{ salonId: string }>();

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
                        component={Link}
                        to={`/hairsalon/reservation/${stylist.stylistId}`} // 원하는 경로로 바꿔줘
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
    </Box>
  );
};

export default Stylists;
