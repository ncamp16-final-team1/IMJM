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
import { useReservation } from '../../hooks/reservation/useReservation';

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

  const {
    selectedDate,
    reservationInfo,
    handleDateSelect: baseHandleDateSelect,
    handleMenuSelect: baseHandleMenuSelect,
  } = useReservation();

  useEffect(() => {
    if (salonNameFromNavigation) {
      setSalonName(salonNameFromNavigation);

    } 
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

    const currentSalonId = stylistSchedule?.salonId || salonId || '';
    
    baseHandleMenuSelect(
      currentSalonId,
      salonName,
      menu, 
      stylistSchedule?.stylistId || null,
      stylistSchedule?.name || '',
      selectedDate,
      selectedTime,
      selectedType,
      setSelectedMenuName
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
  }, [salonName, reservationInfo]);

  if (!stylistSchedule) return <Typography>Loading...</Typography>;

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