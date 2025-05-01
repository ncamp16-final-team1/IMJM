import {
    Box,
    Typography,
    Button,
    Avatar,
    Stack,
    Paper,
    Divider,
    Chip
} from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import ChatIcon from '@mui/icons-material/Chat';
import RateReviewIcon from '@mui/icons-material/RateReview';
import EventIcon from '@mui/icons-material/Event';
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
        
        isPastAppointment;
        
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
        <Paper elevation={0} sx={{ maxWidth: '100vw' }}>
            <Divider sx={{ marginY: 2, borderColor: 'grey.500', borderWidth: 2 }} />
            
            <Box sx={{ display: 'flex', mb: 3 }}>
                <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" fontWeight="bold">{salonName}
                        <Chip 
                        label={status === 'upcoming' ? '예정된 예약' : (isReviewed ? '리뷰 작성 완료' : '리뷰 미작성')}
                        color={status === 'upcoming' ? 'success' : (isReviewed ? 'primary' : 'error')}
                        size="small"
                        variant="outlined"
                        sx = {{ ml: '10px' }}
                        />
                    </Typography>
                    <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mt: 0.5 }}>
                        <StarIcon sx={{ color: '#FFD700', fontSize: 18 }} />
                        <Typography variant="body2" color="text.secondary">
                            {(salonScore || "별점없음")} ({(reviewCount || "리뷰없음")})
                        </Typography>
                    </Stack>
                    <Typography variant="body2" sx={{ mt: 0.5 }}>{salonAddress}</Typography>
                    <Typography variant="body2" color="text.secondary">{formattedDateTime}</Typography>
                    <Typography variant="body2" color="text.secondary">스타일리스트 : {stylistName}</Typography>
                    <Typography variant="body2" sx={{ mt: 0.5, fontWeight: 'bold' }}>{price.toLocaleString()} KRW</Typography>
                </Box>

                <Avatar
                    variant="rounded"
                    src={salonPhotoUrl}
                    sx={{ width: '300px', height: '150px', ml: 2 }}
                />
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography
                    variant="body1"
                    sx={{
                        display: 'inline-block',
                        border: '1px solid',
                        borderColor: '#FF9080', 
                        borderRadius: 4,
                        padding: '8px 12px',
                        textTransform: 'none',
                        color: '#FF9080',
                        fontWeight: 500, 
                    }}
                >
                    {serviceName}
                </Typography>

                <Stack direction="row" spacing={1}>
                    <Button 
                        variant="outlined" 
                        size="medium" 
                        onClick={async () => {
                            try {
                            const chatRoom = await ChatService.getChatRoomByReservation(reservationId);
                            navigate(`/chat/${chatRoom.id}`);
                            } catch (error) {
                            console.error('채팅방 이동 중 오류 발생:', error);
                            alert('채팅방으로 이동할 수 없습니다. 잠시 후 다시 시도해주세요.');
                            }
                        }}
                        sx={{
                            borderRadius: 4,
                            textTransform: 'none',
                            backgroundColor: 'transparent', 
                            borderColor: '#FF9080', 
                            color: '#FF9080',
                            boxShadow: 'none', 
                            '&:hover': {
                            backgroundColor: 'rgba(255, 144, 128, 0.1)', 
                            borderColor: '#FF9080',
                            boxShadow: 'none', 
                            },
                        }} 
                        startIcon={<ChatIcon fontSize="small" />}
                        >
                        1:1 Chat
                    </Button>

                    <Button
                        variant="contained"
                        size="medium"
                        sx={{
                            borderRadius: 4,
                            textTransform: 'none',
                            backgroundColor: buttonConfig.color, 
                            borderColor: buttonConfig.color, 
                            color: 'white',
                            boxShadow: 'none',
                            '&:hover': {
                            backgroundColor: buttonConfig.color,
                            opacity: 0.9,
                            boxShadow: 'none', 
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