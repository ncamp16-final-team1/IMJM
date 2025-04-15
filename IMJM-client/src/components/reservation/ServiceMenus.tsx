// src/components/reservation/ServiceMenus.tsx
import { Box, Typography, Button, Divider } from '@mui/material';
import { ServiceMenusSectionProps } from '../../type/reservation/reservation';

const ServiceMenus = ({
  selectedType,
  isMenuLoading,
  serviceMenus,
  selectedMenuName,
  handleMenuSelect
} : ServiceMenusSectionProps) => {
  if (!selectedType) return null;

  return (
    <Box>  
      <Divider sx={{ marginY: 5, borderColor: 'grey.500', borderWidth: 2 }} />
      <Box 
        sx={{ 
          mt: 2, 
          borderRadius: 2
        }}
      >
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
                key={menu.id || `menu-${Math.random()}`} // id가 없을 경우 대체 키 제공
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
                    onClick={() => handleMenuSelect(menu)}
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
                    선택
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
    </Box>
  );
};

export default ServiceMenus;