import {
    Box,
    Typography,
    Button,
    Avatar,
    Stack,
    Paper,
    Divider,
    Chip,
    Tooltip
} from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import ChatIcon from '@mui/icons-material/Chat';
import RateReviewIcon from '@mui/icons-material/RateReview';
import EventIcon from '@mui/icons-material/Event';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PersonIcon from '@mui/icons-material/Person';
import { useState, useEffect } from 'react';
import { UserReservations } from '../../services/reservation/getUserReservations';
import ChatService from '../../services/chat/ChatService';
import { useNavigate } from 'react-router-dom';

export default function AppointmentCard({
                                            salonId,
                                            salonName,
                                            salonScore,
                                            reviewCount,
                                            salonAddress,
                                            reservationDate,
                                            reservationTime,
                                            price,
                                            salonPhotoUrl,
                                            isReviewed,
                                            serviceName,
                                            reservationId,
                                            reviewId,
                                            stylistName,
                                        }: UserReservations) {

    const navigate = useNavigate();
    const [formattedDateTime, setFormattedDateTime] = useState<string>("");
    const [status, setStatus] = useState<'upcoming' | 'past-no-review' | 'past-with-review'>('upcoming');

    useEffect(() => {
        const parseDateTime = () => {
            const dateObj = new Date(reservationDate);
            const timeParts = reservationTime.split(':').map(Number);
            dateObj.setHours(timeParts[0], timeParts[1], 0);

            return dateObj;
        };

        const appointmentDate = parseDateTime();
        const now = new Date();
        const isPastAppointment = appointmentDate < now;

        if (!isPastAppointment) {
            setStatus('upcoming');
        } else if (isPastAppointment && !isReviewed) {
            setStatus('past-no-review');
        } else if (isPastAppointment && isReviewed) {
            setStatus('past-with-review');
        }

        const formattedTime = reservationTime.slice(0, 5);
        const formatted = `${reservationDate} / ${formattedTime}`;
        setFormattedDateTime(formatted);
    }, [reservationDate, reservationTime, isReviewed]);

    const getButtonConfig = () => {
        switch (status) {
            case 'upcoming':
                return {
                    label: 'View Reservation',
                    icon: <EventIcon fontSize="small" />,
                    color: '#4CAF50',
                    action: () => {
                        navigate(`/my/reservation-detail/${reservationId}`,{
                            state:{
                                salonPhotoUrl,
                            }
                        });
                    }
                };
            case 'past-no-review':
                return {
                    label: 'Write a Review',
                    icon: <RateReviewIcon fontSize="small" />,
                    color: '#FF9080',
                    action: () => {
                        navigate(`/my/write-review`, {
                            state: {
                                salonId,
                                reservationId,
                                salonName,
                                salonScore,
                                reviewCount,
                                salonAddress,
                                reservationDate,
                                reservationTime,
                                price,
                                salonPhotoUrl,
                                serviceName,
                                stylistName,
                                reviewId,
                            }
                        });
                    }
                };
            case 'past-with-review':
                return {
                    label: 'View Review',
                    icon: <RateReviewIcon fontSize="small" />,
                    color: '#2196F3',
                    action: () => {
                        navigate(`/my/view-review`,{
                            state: {
                                salonId,
                                reviewId,
                                salonName,
                                salonScore,
                                reviewCount,
                                salonAddress,
                                reservationDate,
                                reservationTime,
                                price,
                                serviceName,
                                stylistName,
                                salonPhotoUrl,
                                reservationId,
                            }
                        });
                    }
                };
        }
    };

    const buttonConfig = getButtonConfig();

    return (
        <Paper
            elevation={0}
            sx={{
                p: 3,
                borderRadius: 2,
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 20px rgba(0,0,0,0.12)'
                }
            }}
        >
            <Box sx={{ display: 'flex', mb: 2 }}>
                <Box
                    sx={{
                        flexGrow: 1,
                        cursor: 'pointer',
                    }}
                    onClick={() => navigate(`/my/reservation-detail/${reservationId}`, {
                        state: {
                            salonPhotoUrl,
                        }
                    })}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Typography variant="h6" fontWeight="bold" sx={{ mr: 1 }}>{salonName}</Typography>
                        <Chip
                            label={status === 'upcoming' ? 'Upcoming' : (isReviewed ? 'Reviewed' : 'Pending Review')}
                            color={status === 'upcoming' ? 'success' : (isReviewed ? 'primary' : 'warning')}
                            size="small"
                            variant="outlined"
                            sx={{
                                height: '20px',
                                '& .MuiChip-label': {
                                    px: 1,
                                    fontSize: '0.625rem',
                                    fontWeight: 600
                                }
                            }}
                        />
                    </Box>

                    <Stack spacing={0.5}>
                        <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
                            <StarIcon sx={{ color: '#FFD700', fontSize: 16, mr: 0.5 }} />
                            <Typography variant="body2" fontSize={13}>
                                {(salonScore || "No ratings")} ({(reviewCount || "0")})
                            </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
                            <LocationOnIcon sx={{ fontSize: 16, mr: 0.5 }} />
                            <Typography
                                variant="body2"
                                fontSize={13}
                                sx={{
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                    maxWidth: '190px'
                                }}
                            >
                                {salonAddress}
                            </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
                            <EventIcon sx={{ fontSize: 16, mr: 0.5 }} />
                            <Typography variant="body2" fontSize={13}>{formattedDateTime}</Typography>
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
                            <PersonIcon sx={{ fontSize: 16, mr: 0.5 }} />
                            <Typography variant="body2" fontSize={13}>Stylist: {stylistName}</Typography>
                        </Box>

                        <Typography
                            variant="body2"
                            fontWeight="bold"
                            sx={{ mt: 0.5 }}
                        >
                            ${price.toLocaleString()}
                        </Typography>
                    </Stack>
                </Box>

                <Avatar
                    variant="rounded"
                    src={salonPhotoUrl}
                    sx={{
                        width: 100,
                        height: 80,
                        ml: 2,
                        borderRadius: 1,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}
                />
            </Box>

            <Divider sx={{ my: 2, opacity: 0.6 }} />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Chip
                    label={serviceName}
                    variant="outlined"
                    sx={{
                        borderColor: '#FF9080',
                        color: '#FF9080',
                        fontWeight: 500,
                        borderRadius: 4
                    }}
                />

                <Stack direction="row" spacing={1}>
                    <Tooltip title="Chat with salon">
                        <Button
                            variant="text"
                            size="small"
                            onClick={async () => {
                                try {
                                    const chatRoom = await ChatService.getChatRoomByReservation(reservationId);
                                    navigate(`/chat/${chatRoom.id}`);
                                } catch (error) {
                                    console.error('Error navigating to chat room:', error);
                                    alert('Unable to open chat room. Please try again later.');
                                }
                            }}
                            sx={{
                                minWidth: 'unset',
                                borderRadius: '50%',
                                p: 1,
                                color: '#FF9080',
                                '&:hover': {
                                    backgroundColor: 'rgba(255, 144, 128, 0.1)',
                                }
                            }}
                        >
                            <ChatIcon fontSize="small" />
                        </Button>
                    </Tooltip>

                    <Button
                        variant="contained"
                        size="small"
                        sx={{
                            borderRadius: '20px',
                            textTransform: 'none',
                            backgroundColor: buttonConfig.color,
                            color: 'white',
                            boxShadow: 'none',
                            px: 2,
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            '&:hover': {
                                backgroundColor: buttonConfig.color,
                                opacity: 0.9,
                                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                            },
                        }}
                        onClick={buttonConfig.action}
                        startIcon={buttonConfig.icon}
                    >
                        {buttonConfig.label}
                    </Button>
                </Stack>
            </Box>
        </Paper>
    );
}