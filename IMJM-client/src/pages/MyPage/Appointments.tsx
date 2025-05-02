import { useState, useEffect } from "react";
import { 
  Box, 
  Typography,
  Select, 
  MenuItem, 
  FormControl, 
  SelectChangeEvent
} from '@mui/material';

import AppointmentCard from '../../components/reservation/AppointmentCard';
import { getUserReservations, UserReservations } from '../../services/reservation/getUserReservations';

export default function Appointments() {

  const [appointments, setAppointments] = useState<UserReservations[]>([]);
  const [selectedOption, setSelectedOption] = useState("All");
  const [loading, setLoading] = useState(true);

  const handleChange = (e: SelectChangeEvent<string>) => {
    setSelectedOption(e.target.value);
  };

  const menuItemStyle = {
    backgroundColor: '#FF9080',
    color: 'black',
    '&:hover': {
      backgroundColor: '#FF9080',
      color: 'white',
    },
    '&.Mui-selected': {
      backgroundColor: '#FF9080',
      color: 'white',
      '&:hover': {
        backgroundColor: '#FF7A6B',
      }
    },
  };

  const selectStyle = {
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: '#FF9080',
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: '#FF9080',
    },
    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: '#FF9080',
    },
    backgroundColor: '#FF9080',
    color: '#fff',
    '& .MuiSelect-icon': {
      color: '#fff',
    },
    paddingRight: '10px',
    width: '14vw'
  };

  useEffect(() => {
    const loadAppointments = async () => {
      try {
        const data = await getUserReservations(); 
        setAppointments(data);
      } catch (err) {
        console.error('예약 불러오기 실패:', err);
      } finally {
        setLoading(false);
      }
    };
  
    loadAppointments();
  }, []);

  if (loading) {
    return <Typography>불러오는 중...</Typography>;
  }

  const now = new Date();


  const getFilteredAndSortedAppointments = () => {

    const filtered = appointments.filter((appointment) => {
      const appointmentDate = new Date(appointment.reservationDate);
      const timeParts = appointment.reservationTime.split(':').map(Number);
      appointmentDate.setHours(timeParts[0], timeParts[1], 0);
      const isPastAppointment = appointmentDate < now;
      
      switch (selectedOption) {
        case "All":
          return true; 
        case "Reservation":
          return !isPastAppointment; 
        case "WriteAreview":
          return isPastAppointment && !appointment.isReviewed; 
        case "ViewReview":
          return isPastAppointment && appointment.isReviewed; 
        default:
          return true;
      }
    });
    
    return filtered.sort((a, b) => {
      const dateA = new Date(a.reservationDate);
      const dateB = new Date(b.reservationDate);
      const timePartsA = a.reservationTime.split(':').map(Number);
      const timePartsB = b.reservationTime.split(':').map(Number);
      dateA.setHours(timePartsA[0], timePartsA[1], 0);
      dateB.setHours(timePartsB[0], timePartsB[1], 0);
      
      switch (selectedOption) {
        case "Reservation":
          // 예약 - 가까운 날짜순 (오름차순)
          return dateA.getTime() - dateB.getTime();
        case "WriteAreview":
        case "ViewReview":
          // 리뷰 - 최신순 (내림차순)
          return dateB.getTime() - dateA.getTime();
        case "All":
        default:
          // 기본적으로 모든 항목은 다음과 같이 정렬:
          // 1. 미래 예약을 가까운 순으로 정렬
          // 2. 과거 예약을 최신순으로 정렬
          // 3. 미래 예약이 과거 예약보다 먼저 오도록
          const isPastA = dateA < now;
          const isPastB = dateB < now;
          
          if (!isPastA && !isPastB) return dateA.getTime() - dateB.getTime();
          if (isPastA && isPastB) return dateB.getTime() - dateA.getTime();
          return isPastA ? 1 : -1;
      }
    });
  };

  const filteredAppointments = getFilteredAndSortedAppointments();

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
          Reservation list
        </Typography>
        <FormControl>
          <Select
            value={selectedOption}
            onChange={handleChange}
            sx={selectStyle}
          >
            <MenuItem value="All" sx={menuItemStyle}>
              All
            </MenuItem>
            <MenuItem value="Reservation" sx={menuItemStyle}>
            Reservation
            </MenuItem>
            <MenuItem value="WriteAreview" sx={menuItemStyle}>
              Write a review
            </MenuItem>
            <MenuItem value="ViewReview" sx={menuItemStyle}>
              View Review
            </MenuItem>
          </Select>
        </FormControl>
      </Box>

      {filteredAppointments.length > 0 ? (
        filteredAppointments.map((item, index) => (
          <AppointmentCard
            key={index}
            salonId={item.salonId}
            salonName={item.salonName}
            salonScore={item.salonScore}
            reviewCount={item.reviewCount}
            salonAddress={item.salonAddress}
            reservationDate={item.reservationDate}
            reservationTime={item.reservationTime}
            price={item.price}
            salonPhotoUrl={item.salonPhotoUrl}
            isReviewed={item.isReviewed}
            serviceName={item.serviceName}
            reservationId={item.reservationId}
            reviewId={item.reviewId}
            stylistName={item.stylistName}          
          />
        ))
      ) : (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '200px', 
          border: '1px solid #ddd', 
          borderRadius: '8px',
          mt: 4
        }}>
          <Typography variant="h6" color="text.secondary">
            {selectedOption === "All" && "예약된 것이 없습니다."}
            {selectedOption === "Reservation" && "예정된 예약이 없습니다."}
            {selectedOption === "WriteAreview" && "리뷰 작성할 예약이 없습니다."}
            {selectedOption === "ViewReview" && "작성한 리뷰가 없습니다."}
          </Typography>
        </Box>
      )}
    </Box>
  );
}