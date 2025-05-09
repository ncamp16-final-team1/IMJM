import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Select,
  MenuItem,
  FormControl,
  SelectChangeEvent,
  Paper,
  Divider,
  Skeleton,
  Alert,
  Fade,
  useTheme,
  useMediaQuery,
  Container,
  Button
} from '@mui/material';

import AppointmentCard from '../../components/reservation/AppointmentCard';
import { getUserReservations, UserReservations } from '../../services/reservation/getUserReservations';
import FilterListIcon from '@mui/icons-material/FilterList';
import ChatIcon from '@mui/icons-material/Chat';

export default function Appointments() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [appointments, setAppointments] = useState<UserReservations[]>([]);
  const [selectedOption, setSelectedOption] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: SelectChangeEvent<string>) => {
    setSelectedOption(e.target.value);
  };

  useEffect(() => {
    const loadAppointments = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getUserReservations();
        setAppointments(data);
      } catch (err) {
        console.error('Failed to load appointments:', err);
        setError('Failed to load appointments. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadAppointments();
  }, []);

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
          return dateA.getTime() - dateB.getTime();
        case "WriteAreview":
        case "ViewReview":
          return dateB.getTime() - dateA.getTime();
        case "All":
        default:
          const isPastA = dateA < now;
          const isPastB = dateB < now;

          if (!isPastA && !isPastB) return dateA.getTime() - dateB.getTime();
          if (isPastA && isPastB) return dateB.getTime() - dateA.getTime();
          return isPastA ? 1 : -1;
      }
    });
  };

  const filteredAppointments = getFilteredAndSortedAppointments();

  // This is a mock replacement for the AppointmentCard component's chat button
  const ChatButton = ({ onChatClick }) => (
      <Button
          variant="outlined"
          size="small"
          onClick={onChatClick}
          startIcon={<ChatIcon fontSize="small" />}
          sx={{
            borderRadius: '16px',
            textTransform: 'none',
            borderColor: '#aaa', // Muted color
            color: '#666', // Muted text color
            backgroundColor: 'transparent',
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.04)',
              borderColor: '#888',
            },
            fontSize: '0.75rem',
            py: 0.5,
            px: 1.5
          }}
      >
        Chat
      </Button>
  );

  return (
      <Container maxWidth="sm" sx={{ py: 3 }}>
        <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 2,
              backgroundColor: '#fff',
              boxShadow: '0 2px 12px rgba(0,0,0,0.06)' // Reduced shadow intensity
            }}
        >
          <Box sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 3
          }}>
            <Typography
                variant="h5"
                sx={{
                  fontWeight: 700,
                  color: '#444', // Simple dark gray instead of gradient
                  letterSpacing: '-0.5px'
                }}
            >
              Reservation List
            </Typography>

            <FormControl
                variant="outlined"
                size="small"
                sx={{
                  minWidth: 150, // Increased to prevent overlap
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    backgroundColor: '#f9f9f9',
                    transition: 'all 0.2s',
                    '&:hover': {
                      backgroundColor: '#f5f5f5'
                    },
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'transparent'
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#aaa', // Muted color
                      borderWidth: 1
                    },
                    '& .MuiSelect-select': {
                      paddingRight: '32px', // Added space for the dropdown icon
                    }
                  }
                }}
            >
              <Select
                  value={selectedOption}
                  onChange={handleChange}
                  displayEmpty
                  startAdornment={<FilterListIcon sx={{ color: '#666', mr: 1, fontSize: 20 }} />}
                  sx={{
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    color: '#555' // Muted text color
                  }}
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        boxShadow: '0 2px 10px rgba(0,0,0,0.08)'
                      }
                    }
                  }}
              >
                <MenuItem value="All">All Reservations</MenuItem>
                <MenuItem value="Reservation">Upcoming</MenuItem>
                <MenuItem value="WriteAreview">Write Review</MenuItem>
                <MenuItem value="ViewReview">View Review</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <Divider sx={{ my: 2, opacity: 0.4 }} /> {/* Reduced opacity for subtlety */}

          {error && (
              <Fade in={Boolean(error)}>
                <Alert
                    severity="error"
                    sx={{ mb: 2, borderRadius: 2 }}
                    onClose={() => setError(null)}
                >
                  {error}
                </Alert>
              </Fade>
          )}

          {loading ? (
              [...Array(3)].map((_, idx) => (
                  <Box key={idx} sx={{ mb: 4 }}>
                    <Box sx={{ display: 'flex', mb: 2 }}>
                      <Box sx={{ flexGrow: 1 }}>
                        <Skeleton variant="text" width="70%" height={30} />
                        <Skeleton variant="text" width="40%" />
                        <Skeleton variant="text" width="60%" />
                        <Skeleton variant="text" width="50%" />
                      </Box>
                      <Skeleton variant="rectangular" width={120} height={80} sx={{ ml: 2, borderRadius: 2 }} />
                    </Box>
                    <Skeleton variant="rectangular" height={40} sx={{ borderRadius: 8 }} />
                  </Box>
              ))
          ) : filteredAppointments.length > 0 ? (
              <Box sx={{
                '& > div:not(:last-child)': {
                  mb: 3
                }
              }}>
                {filteredAppointments.map((item, index) => (
                    <Fade
                        key={item.reservationId}
                        in={true}
                        timeout={300 + index * 100}
                    >
                      <Box>
                        {/* Note: You would need to update your AppointmentCard component
                            to accept the textWithIcon prop for the chat button.
                            This is a mockup of what would need to change */}
                        <AppointmentCard
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
                            // Include ChatButton component or pass text indicator for the icons
                            // textWithIcon={true}
                        />
                      </Box>
                    </Fade>
                ))}
              </Box>
          ) : (
              <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                height: 200,
                py: 5,
                backgroundColor: '#f9f9f9',
                borderRadius: 2
              }}>
                <Typography
                    variant="h6"
                    color="text.secondary"
                    sx={{ fontWeight: 500, mb: 1 }}
                >
                  {selectedOption === "All" && "No reservations found."}
                  {selectedOption === "Reservation" && "No upcoming reservations."}
                  {selectedOption === "WriteAreview" && "No reservations to review."}
                  {selectedOption === "ViewReview" && "No reviews found."}
                </Typography>
                <Typography variant="body2" color="text.secondary" align="center">
                  {selectedOption === "All" && "Create a new reservation to get started."}
                  {selectedOption === "Reservation" && "Book a new appointment to change your style."}
                  {selectedOption === "WriteAreview" && "You can write a review after completing your visit."}
                  {selectedOption === "ViewReview" && "Reviews will appear here after you write them."}
                </Typography>
              </Box>
          )}
        </Paper>
      </Container>
  );
}