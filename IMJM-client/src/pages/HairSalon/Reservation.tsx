import { useParams, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Container, Paper, Typography } from '@mui/material';
import dayjs from 'dayjs';
import 'dayjs/locale/ko';

import ProfileSection from '../../components/reservation/ProfileSection';
import CalendarSection from '../../components/reservation/CalendarSection';
import HolidayNotice from '../../components/reservation/HolidayNotice';
import TimeSlotsSection from '../../components/reservation/TimeSlotsSection';
import ServiceTypes from '../../components/reservation/ServiceTypes';
import ServiceMenus from '../../components/reservation/ServiceMenus';

import { useStylistSchedule } from '../../hooks/reservation/useStylistSchedule';
import { useTimeSlots } from '../../hooks/reservation/useTimeSlots';
import { useServiceTypes } from '../../hooks/reservation/useServiceTypes';
import { useReservation } from '../../hooks/reservation/useDispatch';

import { isHoliday, isAM } from '../../utils/reservation/dateUtils';

const Reservation = () => {
  const { stylistId, salonId } = useParams<{ stylistId: string; salonId: string }>();
  const location = useLocation();
  
  // location.state에서 salonName을 가져옴
  const navigationState = location.state || {};
  const salonNameFromNavigation = navigationState.salonName;
  
  // salonName 상태 관리
  const [salonName, setSalonName] = useState(salonNameFromNavigation || '');
  const [selectedMenuObj, setSelectedMenuObj] = useState(null);

  const {
    stylistSchedule,
    isSelectedDateHoliday,
    setIsSelectedDateHoliday,
  } = useStylistSchedule(stylistId);

  const {
    allTimeSlots,
    selectedTime,
    setSelectedTime,
    isLoading: isTimeLoading,
    fetchAvailableTimes,
    isTimeSlotAvailable: checkTimeAvailability
  } = useTimeSlots(stylistId);

  const {
    showServiceType,
    setShowServiceType,
    selectedType,
    setSelectedType,
    serviceMenus,
    setServiceMenus,
    isMenuLoading,
    serviceTypes,
    selectedMenuName,
    setSelectedMenuName,
    fetchServiceTypes,
    handleTypeChange,
    sliderRef,
    showLeftArrow,
    showRightArrow,
    handleMouseDown,
    handleMouseMove,
    handleMouseUpOrLeave,
    handleTouchStart,
    handleTouchMove,
    handleArrowClick
  } = useServiceTypes();

  // useReservation 훅 호출
  const {
    selectedDate,
    reservationInfo,
    handleDateSelect: baseHandleDateSelect,
    handleMenuSelect: baseHandleMenuSelect,
  } = useReservation();

  // salonName 업데이트 로직
  useEffect(() => {
    // 네비게이션에서 받은 salonName이 있으면 그것을 사용
    if (salonNameFromNavigation) {
      setSalonName(salonNameFromNavigation);

    } 
    // 스타일리스트 스케줄에서 살롱 이름을 가져올 수 있으면 사용
    else if (stylistSchedule?.salonName && !salonName) {
      setSalonName(stylistSchedule.salonName);

    }
  }, [stylistSchedule, salonNameFromNavigation]);

  const resetMenu = () => {
    setSelectedTime(null);
    setShowServiceType(false);
    setSelectedType(null);
    setServiceMenus([]);
    setSelectedMenuName(null);
    setSelectedMenuObj(null); 
  };

  const isTimeSlotAvailable = (time, isHoliday, date) => {
    return checkTimeAvailability(time, isHoliday, date);
  };

  const handleTimeSelect = (time, isHoliday, date) => {
    if (isTimeSlotAvailable(time, isHoliday, date)) {
      if (selectedTime === time) {
        setSelectedTime(null);
        resetMenu(); 
      } else {
        setSelectedTime(time);
        setShowServiceType(true);
        setSelectedType(null); 
        setServiceMenus([]); 

        // salonId를 명시적으로 사용
        const currentSalonId = stylistSchedule?.salonId || salonId;
        if (currentSalonId) {
          fetchServiceTypes(currentSalonId);
        }
      }
    }
  };

  const handleDateSelect = (date) => {
    const resetTimeSelection = () => {
      setSelectedTime(null);
      setShowServiceType(false);
    };

    const resetServiceSelection = () => {
      setSelectedType(null);
      setServiceMenus([]);
      setSelectedMenuName(null);
      setSelectedMenuObj(null); 
    };

    baseHandleDateSelect(
      date,
      stylistSchedule,
      resetTimeSelection,
      resetServiceSelection,
      fetchAvailableTimes,
      setIsSelectedDateHoliday
    );
  };

  const handleMenuSelect = (menu) => {
    if (menu === null) {
      setSelectedMenuName(null);
      setSelectedMenuObj(null); 
    } else {
      setSelectedMenuName(menu.serviceName);
      setSelectedMenuObj(menu); 
    }

    // 현재 가지고 있는 salonName 사용
    const currentSalonId = stylistSchedule?.salonId || salonId || '';
    
    baseHandleMenuSelect(
      currentSalonId,
      menu,
      stylistSchedule?.stylistId || null,
      stylistSchedule?.name || '',
      selectedDate,
      selectedTime,
      selectedType,
      setSelectedMenuName,
      salonName // salonName을 추가로 전달
    );
  };

  // 초기 데이터 로딩
  useEffect(() => {
    if (stylistSchedule && !selectedDate) {
      handleDateSelect(dayjs());
    } else if (stylistSchedule && selectedDate) {
      fetchAvailableTimes(selectedDate);
    }
  }, [stylistSchedule]);

  useEffect(() => {
    if (selectedDate && stylistSchedule) {
      handleDateSelect(selectedDate);
    }
  }, [stylistSchedule]);

  // 디버깅을 위한 useEffect
  useEffect(() => {
    console.log("현재 사용 중인 살롱 이름:", salonName);
    console.log("현재 예약 정보:", reservationInfo);
  }, [salonName, reservationInfo]);

  if (!stylistSchedule) return <Typography>Loading...</Typography>;

  // 최종 사용할 살롱 이름 (우선순위: 상태값 > 스타일리스트 데이터 > 기본값)
  const finalSalonName = salonName || stylistSchedule.salonName || '살롱 이름 없음';

  return (
    <Container disableGutters maxWidth="sm" sx={{ p: 0 }}>
      <Paper elevation={0} sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <ProfileSection 
          stylistSchedule={stylistSchedule} 
          salonName={finalSalonName} // ProfileSection에 salonName 전달
        />
        <CalendarSection
          stylistSchedule={stylistSchedule}
          selectedDate={selectedDate}
          handleDateSelect={handleDateSelect}
          isHoliday={isHoliday}
        />
      </Paper>

      <HolidayNotice isSelectedDateHoliday={isSelectedDateHoliday} />

      <TimeSlotsSection
        isSelectedDateHoliday={isSelectedDateHoliday}
        selectedDate={selectedDate}
        isLoading={isTimeLoading}
        allTimeSlots={allTimeSlots}
        selectedTime={selectedTime}
        handleTimeSelect={handleTimeSelect}
        isTimeSlotAvailable={isTimeSlotAvailable}
        isAM={isAM}
      />

      <ServiceTypes
        showServiceType={showServiceType}
        isMenuLoading={isMenuLoading}
        serviceTypes={serviceTypes}
        selectedType={selectedType}
        handleTypeChange={handleTypeChange}
        sliderRef={sliderRef}
        showLeftArrow={showLeftArrow}
        showRightArrow={showRightArrow}
        handleMouseDown={handleMouseDown}
        handleMouseMove={handleMouseMove}
        handleMouseUpOrLeave={handleMouseUpOrLeave}
        handleTouchStart={handleTouchStart}
        handleTouchMove={handleTouchMove}
        onArrowClick={handleArrowClick}
      />

      <ServiceMenus
        selectedType={selectedType}
        isMenuLoading={isMenuLoading}
        serviceMenus={serviceMenus}
        selectedMenuName={selectedMenuName}
        handleMenuSelect={handleMenuSelect}
        selectedMenu={selectedMenuObj} 
        stylistName={stylistSchedule.name} 
        selectedDate={selectedDate ? selectedDate.format('YYYY-MM-DD') : ''} 
        selectedTime={selectedTime || ''} 
        salonName={finalSalonName} // 확정된 살롱 이름 전달
      />
    </Container>
  );
};

export default Reservation;