import { useParams } from 'react-router-dom';
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
  const { stylistId } = useParams<{ stylistId: string; salonId: string }>();
  
 
  const [selectedMenuObj, setSelectedMenuObj] = useState(null);
  
 
  const { 
    stylistSchedule, 
    isSelectedDateHoliday, 
    setIsSelectedDateHoliday 
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


  const resetMenu = () => {
    setSelectedTime(null);
    setShowServiceType(false);
    setSelectedType(null);
    setServiceMenus([]);
    setSelectedMenuName(null);
    setSelectedMenuObj(null); 
  };

 
  const isTimeSlotAvailable = (time: string, isHoliday: boolean, date: dayjs.Dayjs | null) => {
    return checkTimeAvailability(time, isHoliday, date);
  };


  const handleTimeSelect = (time: string, isHoliday: boolean, date: dayjs.Dayjs | null) => {
    if (isTimeSlotAvailable(time, isHoliday, date)) {
      if (selectedTime === time) {
        setSelectedTime(null);
        resetMenu(); 
      } else {
        setSelectedTime(time);
        setShowServiceType(true);
        setSelectedType(null); 
        setServiceMenus([]); 
        

        if (stylistSchedule?.salonId) {
          fetchServiceTypes(stylistSchedule.salonId);
        }
      }
    }
  };

  const handleDateSelect = (date: dayjs.Dayjs | null) => {
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

  const handleMenuSelect = (menu: any) => {
    if (menu === null) {
      setSelectedMenuName(null);
      setSelectedMenuObj(null); 
    } else {
      setSelectedMenuName(menu.serviceName);
      setSelectedMenuObj(menu); 
    }

    baseHandleMenuSelect(
      stylistSchedule?.salonId || '',
      menu,
      stylistSchedule?.stylistId || null,
      stylistSchedule?.name || '',
      selectedDate,
      selectedTime,
      selectedType,
      setSelectedMenuName
    );
  };

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

  if (!stylistSchedule) return <Typography>Loading...</Typography>;

  return (
    <Container disableGutters maxWidth="sm" sx={{ p: 0 }}>
      <Paper elevation={0} sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <ProfileSection stylistSchedule={stylistSchedule} />

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
      />
    </Container>
  );
};

export default Reservation;