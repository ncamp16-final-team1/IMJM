import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Select,
  MenuItem,
  FormControl,
  SelectChangeEvent,
  styled
} from '@mui/material';

import AppointmentCard from '../../components/reservation/AppointmentCard';
import { getUserReservations, UserReservations } from '../../services/reservation/getUserReservations';

// Styled components for improved dropdown design
const StyledFormControl = styled(FormControl)(({ theme }) => ({
  minWidth: 150,
  '& .MuiOutlinedInput-root': {
    borderRadius: 8,
    transition: 'all 0.3s ease',
    backgroundColor: '#FF9080',
    color: '#fff',
    fontWeight: 500,
    '&:hover': {
      backgroundColor: '#FF7A6B',
    },
    '&.Mui-focused': {
      backgroundColor: '#FF7A6B',
    }
  }
}));

const StyledMenuItem = styled(MenuItem)({
  padding: '10px 15px',
  margin: '2px 0',
  borderRadius: 4,
  '&:hover': {
    backgroundColor: '#FFF0EE',
  },
  '&.Mui-selected': {
    backgroundColor: '#FFDED9',
    fontWeight: 'bold',
    '&:hover': {
      backgroundColor: '#FFCEC7',
    }
  }
});

export default function Appointments() {

  const [appointments, setAppointments] = useState<UserReservations[]>([]);
  const [selectedOption, setSelectedOption] = useState("All");
  const [loading, setLoading] = useState(true);

  const handleChange = (e: SelectChangeEvent<string>) => {
    setSelectedOption(e.target.value);
  };

  useEffect(() => {
    const loadAppointments = async () => {
      try {
        const data = await getUserReservations();
        setAppointments(data);
      } catch (err) {
        console.error('Failed to load appointments:', err);
      } finally {
        setLoading(false);
      }
    };

    loadAppointments();
  }, []);

  if (loading) {
    return <Typography>Loading...</Typography>;
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
          // Upcoming reservations - ascending order
          return dateA.getTime() - dateB.getTime();
        case "WriteAreview":
        case "ViewReview":
          // Reviews - descending order (newest first)
          return dateB.getTime() - dateA.getTime();
        case "All":
        default:
          // Default sorting:
          // 1. Future reservations in ascending order
          // 2. Past reservations in descending order
          // 3. Future before past
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
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
            Reservation List
          </Typography>
          <StyledFormControl>
            <Select
                value={selectedOption}
                onChange={handleChange}
                variant="outlined"
                MenuProps={{
                  PaperProps: {
                    sx: {
                      borderRadius: 2,
                      mt: 1,
                      boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                      maxHeight: 300
                    }
                  }
                }}
            >
              <StyledMenuItem value="All">All</StyledMenuItem>
              <StyledMenuItem value="Reservation">Upcoming</StyledMenuItem>
              <StyledMenuItem value="WriteAreview">Write Review</StyledMenuItem>
              <StyledMenuItem value="ViewReview">View Review</StyledMenuItem>
            </Select>
          </StyledFormControl>
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
                {selectedOption === "All" && "No reservations found."}
                {selectedOption === "Reservation" && "No upcoming reservations."}
                {selectedOption === "WriteAreview" && "No reservations to review."}
                {selectedOption === "ViewReview" && "No reviews found."}
              </Typography>
            </Box>
        )}
      </Box>
  );
}