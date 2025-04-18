import { Box, Button, Typography, Divider } from '@mui/material';
import {
  KeyboardArrowLeft as KeyboardArrowLeftIcon,
  KeyboardArrowRight as KeyboardArrowRightIcon
} from '@mui/icons-material';
import { ServiceTypesSectionProps } from '../../type/reservation/reservation';

const ServiceTypes = ({
  showServiceType,
  isMenuLoading,
  serviceTypes,
  selectedType,
  handleTypeChange,
  sliderRef,
  showLeftArrow,
  showRightArrow,
  handleMouseDown,
  handleMouseMove,
  handleMouseUpOrLeave,
  handleTouchStart,
  handleTouchMove,
  onArrowClick
}: ServiceTypesSectionProps) => {
  if (!showServiceType) return null;

  return (
    <Box>
      <Divider sx={{ marginY: 5, borderColor: 'grey.500', borderWidth: 2 }} />
      <Typography color="text.primary"  
          sx={{ fontWeight: 'bold', fontSize: '18px', my: 2 }}>
        Please choose a service type
      </Typography>

      {isMenuLoading ? (
        <Box sx={{ textAlign: 'center', py: 2 }}>
          <Typography color="text.secondary">
            서비스 메뉴 정보를 불러오는 중입니다...
          </Typography>
        </Box>
      ) : (
        <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          {showLeftArrow && (
            <Box
              sx={{
                position: 'absolute',
                left: 0,
                zIndex: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                border: '1px solid #f8bbd0',
                cursor: 'pointer',
                ml: 0.5,
                '&:hover': {
                  backgroundColor: '#f8bbd0',
                }
              }}
              onClick={() => onArrowClick('left')}
            >
              <KeyboardArrowLeftIcon 
                sx={{ 
                  fontSize: 20,
                  color: '#F06292'
                }} 
              />
            </Box>
          )}
          
          <Box
            ref={sliderRef}
            sx={{
              flex: 1,
              display: 'flex',
              justifyContent: 'start',
              overflowX: 'auto',
              padding: '10px',
              gap: '20px',
              flexWrap: 'nowrap',
              cursor: 'grab',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              '&::-webkit-scrollbar': {
                display: 'none'
              },
              scrollBehavior: 'smooth',
              WebkitOverflowScrolling: 'touch',
              borderRadius: '8px',
              mx: 1,
              paddingLeft: showLeftArrow ? '32px' : '10px',
              paddingRight: showRightArrow ? '32px' : '10px',
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUpOrLeave}
            onMouseLeave={handleMouseUpOrLeave}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleMouseUpOrLeave}
          >
            {serviceTypes.length > 0 ? (
              serviceTypes.map((type, index) => (
                <Button
                  key={`${type}-${index}`}
                  variant={selectedType === type ? 'contained' : 'outlined'}
                  onClick={() => handleTypeChange(type)}
                  sx={{ 
                    flexShrink: 0,
                    minWidth: '80px',
                    backgroundColor: selectedType === type ? '#FDC7BF' : 'white',
                    color: selectedType === type ? 'white' : '#F06292',
                    borderColor: '#F06292',
                    '&:hover': {
                      backgroundColor: selectedType === type ? '#FDE4D0' : '#FEE5EC',
                      borderColor: '#E91E63',
                    },
                    pointerEvents: 'auto', // 항상 클릭 가능하도록 설정
                  }}
                >
                  {type}
                </Button>
              ))
            ) : (
              <Typography color="text.secondary" sx={{ px: 2 }}>
                이용 가능한 서비스 타입이 없습니다.
              </Typography>
            )}
          </Box>
          
          {showRightArrow && (
            <Box
              sx={{
                position: 'absolute',
                right: 0,
                zIndex: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                border: '1px solid #f8bbd0',
                cursor: 'pointer',
                mr: 0.5,
                '&:hover': {
                  backgroundColor: '#f8bbd0',
                }
              }}
              onClick={() => onArrowClick('right')}
            >
              <KeyboardArrowRightIcon 
                sx={{ 
                  fontSize: 20,
                  color: '#F06292'
                }} 
              />
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};

export default ServiceTypes;