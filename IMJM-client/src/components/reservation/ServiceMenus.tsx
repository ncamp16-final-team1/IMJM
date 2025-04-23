import { Box, Typography, Button, Divider } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { ServiceMenusSectionProps, Menu } from '../../type/reservation/reservation';

const ServiceMenus = ({
  selectedType,
  isMenuLoading,
  serviceMenus,
  selectedMenuName,
  handleMenuSelect,
  selectedMenu,
  stylistName,
  selectedDate, 
  selectedTime, 
}: ServiceMenusSectionProps) => {

  const { salonId,stylistId } = useParams(); 
  const navigate = useNavigate(); 

  // 메뉴 선택 핸들러
  const handleMenuSelectInternal = (menu: Menu) => {
    
    if (selectedMenuName === menu.serviceName) {
      handleMenuSelect(null); 
    } else {
      handleMenuSelect(menu); 
    }
  };

  const handleNextPage = () => {
    navigate(`/salon/${salonId}/reservation/${stylistId}/paymentDetails`, {
      state: {
        salonId: salonId ?? '',
        stylistId: stylistId ? parseInt(stylistId) : null,
        stylistName: stylistName, 
        selectedDate: selectedDate,
        selectedTime: selectedTime, 
        selectedType: selectedType,
        selectedMenu: selectedMenu
          ? {
              serviceName: selectedMenu.serviceName,
              serviceDescription: selectedMenu.serviceDescription,
              price: selectedMenu.price,
              id: selectedMenu.id,
            }
          : null,
      },
    });
  };

  if (!selectedType) return null;

  return (
    <Box>  
      <Divider sx={{ marginY: 5, borderColor: 'grey.500', borderWidth: 2 }} />
      <Box sx={{ mt: 2, borderRadius: 2 }}>
        <Typography 
          variant="subtitle1" 
          fontWeight="bold" 
          gutterBottom
          sx={{ 
            display: 'flex', 
            alignItems: 'center',
            fontWeight: 'bold', fontSize: '18px', 
            borderBottom: '2px solid #e0e0e0',
            pb: 1
          }}
        >
          {selectedType} 서비스 메뉴
        </Typography>

        {isMenuLoading ? (
          <Box sx={{ textAlign: 'center', py: 2 }}>
            <Typography color="text.secondary">
              메뉴 정보를 불러오는 중입니다...
            </Typography>
          </Box>
        ) : serviceMenus.length > 0 ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            {serviceMenus.map((menu) => (
              <Box
                key={menu.id || `menu-${Math.random()}`} 
                sx={{
                  p: 2,
                  borderRadius: 1,
                  border: '2px solid #FDC7BF',
                  bgcolor: 'white',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': {
                    borderColor: '#F06292',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.05)'
                  }
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body1" fontWeight="bold">
                    {menu.serviceName || '이름 없음'}
                  </Typography>
                  <Typography variant="body1" color="error" fontWeight="bold">
                    {typeof menu.price === 'number' ? menu.price.toLocaleString() : '0'}KRW
                  </Typography>
                </Box>
                
                {menu.serviceDescription && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    {menu.serviceDescription}
                  </Typography>
                )}
                
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                  <Button 
                    size="small" 
                    variant="outlined" 
                    color="primary"
                    onClick={() => handleMenuSelectInternal(menu)} // 메뉴 선택 핸들러
                    sx={{ 
                      minWidth: '80px',
                      borderColor: '#F06292',
                      color: selectedMenuName === menu.serviceName ? '#ffffff' : '#F06292',
                      backgroundColor: selectedMenuName === menu.serviceName ? '#E91E63' : 'transparent',
                      '&:hover': {
                        backgroundColor: '#FEE5EC',
                        borderColor: '#E91E63'
                      }
                    }}
                  >
                    {selectedMenuName === menu.serviceName ? '취소' : '선택'} {/* 선택된 경우 취소 버튼 표시 */}
                  </Button>
                </Box>
              </Box>
            ))}
          </Box>
        ) : (
          <Box sx={{ textAlign: 'center', py: 2 }}>
            <Typography color="text.secondary">
              이용 가능한 {selectedType} 서비스 메뉴가 없습니다.
            </Typography>
          </Box>
        )}
      </Box>

      {/* "확인" 버튼 추가 */}
      <Box sx={{ textAlign: 'center', mt: 3 }}>
      <Button 
          variant="contained" 
          onClick={handleNextPage} 
          disabled={selectedMenuName === null}
          sx={{ 
            width: '100%', 
            maxWidth: '300px',
            backgroundColor: '#FDC7BF', 
            color: '#fff',              
            '&:hover': {
              backgroundColor: '#e65c50', 
            },
            '&.Mui-disabled': {
              backgroundColor: '#ccc',   
              color: '#666',
            },
          }}
        >
          확인
        </Button>
      </Box>
    </Box>
  );
};

export default ServiceMenus;