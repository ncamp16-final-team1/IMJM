import { useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { 
    Box, 
    Typography,
    TextField, 
    Button, 
    Paper, 
    Stack,
    Divider,
    Avatar,
    Rating,
    Checkbox,
    FormControlLabel,
    Snackbar,
    Alert,
    CircularProgress,
    AlertColor
} from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import axios from 'axios';

// 리뷰 폼에 필요한 타입 정의
interface LocationState {
    salonId: string;
    salonName: string;
    salonScore?: string;
    reviewCount?: string;
    salonAddress?: string;
    reservationDate?: string;
    reservationTime?: string;
    price?: number;
    salonPhotoUrl?: string;
    reservationServiceName?: string;
    stylistName?: string;
}

// 리뷰 데이터 타입 정의
interface ReviewData {
    salonId: string;
    rating: number;
    reviewText: string;
    tags: string[];
}

export default function WriteReview() {
    const location = useLocation();
    const navigate = useNavigate();
    const {
        salonId,
        salonName,
        salonScore,
        reviewCount,
        salonAddress,
        reservationDate,
        reservationTime,
        price,
        salonPhotoUrl,
        reservationServiceName,
        stylistName,
    } = (location.state as LocationState) || {};

    const tagOptions = [
        "The staff is kind",
        "I wash my hair well",
        "It cuts my hair well",
        "The staff is pretty",
        "Love my haircut!",
        "Great service!",
        "Perfect color!",
        "Messy cut",
        "Not what I wanted",
        "Too expensive"
    ];

    const MAX_IMAGES = 3;
    const MAX_CHARS = 100;
    
    const formatTime = (timeString: string): string => {
        if (!timeString) return '';
        return timeString.substring(0, 5);
    };

    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [value, setValue] = useState<number>(0);
    const [reviewText, setReviewText] = useState<string>('');
    const [uploadedImages, setUploadedImages] = useState<File[]>([]);
    const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
    
    // 추가된 상태 관리 변수들
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [alertOpen, setAlertOpen] = useState<boolean>(false);
    const [alertMessage, setAlertMessage] = useState<string>('');
    const [alertSeverity, setAlertSeverity] = useState<AlertColor>('success');

    const handleTagToggle = (tag: string): void => {
        if (selectedTags.includes(tag)) {
            setSelectedTags(selectedTags.filter(t => t !== tag));
        } else {
            setSelectedTags([...selectedTags, tag]);
        }
    };

    const validateReview = (): boolean => {
        if (value === 0) {
            showAlert('별점을 선택해주세요.', 'warning');
            return false;
        }
        
        if (reviewText.trim() === '') {
            showAlert('리뷰 내용을 입력해주세요.', 'warning');
            return false;
        }
        
        return true;
    };
    
    // 알림 표시 함수
    const showAlert = (message: string, severity: AlertColor = 'success'): void => {
        setAlertMessage(message);
        setAlertSeverity(severity);
        setAlertOpen(true);
    };
    
    // 알림 닫기 핸들러
    const handleAlertClose = (): void => {
        setAlertOpen(false);
    };

    const handleSubmit = async (): Promise<void> => {
        // 유효성 검사
        if (!validateReview()) {
            return;
        }
        
        // 제출 중 상태로 변경
        setIsSubmitting(true);
        
        // 1. 리뷰 데이터를 구조화된 객체로 수집
        const reviewData = {
            salonId: salonId, 
            rating: value,
            reviewText,
            tags: selectedTags,
        };
        
        // 2. 이미지 업로드를 위해 FormData 객체 생성
        const formData = new FormData();
        
        // 3. 리뷰 데이터를 JSON 문자열로 변환하여 추가
        formData.append('reviewData', new Blob([JSON.stringify(reviewData)], {type: 'application/json'}));
        
        // 4. 각 이미지 파일을 FormData에 추가
        uploadedImages.forEach((image, index) => {
            formData.append(`image${index}`, image);
        });
        
        try {
            // 5. axios를 사용하여 서버에 데이터 전송
            const response = await axios.post('/api/myPages/review-save', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
                // 타임아웃 설정 (10초)
                timeout: 10000
            });
            
            // 6. 성공 응답 처리
            console.log('리뷰가 성공적으로 제출되었습니다:', response.data);
            showAlert('리뷰가 성공적으로 제출되었습니다!');
            
            // 7. 성공 후 잠시 대기 후 이전 페이지로 이동
            setTimeout(() => {
                navigate('/my-reservations');  // 적절한 경로로 수정
            }, 1500);
            
        } catch (error: any) { 
            // 기존 에러 처리 로직 유지
            console.error('리뷰 제출 중 오류 발생:', error);
            
            let errorMessage = '리뷰 제출 중 오류가 발생했습니다.';
            
            if (error.response) {
                if (error.response.status === 413) {
                    errorMessage = '이미지 파일이 너무 큽니다. 더 작은 이미지를 선택해 주세요.';
                } else if (error.response.data && error.response.data.message) {
                    errorMessage = error.response.data.message;
                }
            } else if (error.request) {
                errorMessage = '서버에 연결할 수 없습니다. 네트워크 연결을 확인해 주세요.';
            } else if (error.code === 'ECONNABORTED') {
                errorMessage = '서버 응답 시간이 초과되었습니다. 나중에 다시 시도해 주세요.';
            }
            
            showAlert(errorMessage, 'error');
        } finally {
            // 9. 제출 상태 종료
            setIsSubmitting(false);
        }
    };

    return (
        <Paper elevation={0} sx={{ maxWidth: '100vw' }}>
            <Typography variant="h4" fontWeight="bold">Write a Review</Typography>

            <Divider sx={{ marginY: 3, borderColor: 'grey.500', borderWidth: 2 }} />
            
            <Box sx={{ display: 'flex', mb: 3 }}>
                <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h4" fontWeight="bold">{salonName}</Typography>
                    <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mt: 0.5 }}>
                        <StarIcon sx={{ color: '#FFD700', fontSize: 30 }} />
                        <Typography variant="body2" color="text.secondary" sx = {{ fontSize: 17 }}>
                            {(salonScore || "별점없음")} ({(reviewCount || "리뷰없음")})
                        </Typography>
                    </Stack>
                    <Typography variant="body2" sx={{ mt: 0.5 }}>{salonAddress}</Typography>
                    <Typography variant="body2" color="text.secondary" sx = {{ mt: 1, mb: 1, fontSize: 17 }}>
                        {reservationDate} / {formatTime(reservationTime || '')}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">스타일리스트 : {stylistName}</Typography>
                    <Typography variant="body2" sx={{ mt: 0.5, fontWeight: 'bold' }}>{price?.toLocaleString()} KRW</Typography>
                </Box>
                <Avatar
                    src={salonPhotoUrl}
                    sx={{ width: '250px', height: '200px', ml: 2, borderRadius: '20px' }}
                />
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center' }}>
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
                    {reservationServiceName}
                </Typography>  
            </Box>

            <Divider sx={{ marginY: 2, borderColor: 'grey.500', borderWidth: 2 }} />

            <Box sx={{ marginTop: 3 }}>
                <Box sx={{ mb: 2 }}>
                    <Rating
                        name="star-rating"
                        value={value}
                        onChange={(_, newValue) => {
                            setValue(newValue === null ? 0 : newValue);
                        }}
                        precision={0.5}
                        size="large"
                        emptyIcon={<StarIcon style={{ opacity: 0.55, color: '#ccc' }} fontSize="inherit" />}
                        sx={{
                            '& .MuiRating-iconFilled': { color: '#FFD700' },
                        }}
                    />
                    <Typography component="span" sx={{ ml: 1 }}>{value}</Typography>
                </Box>

                <Box sx={{ mb: 2 }}>
                    <input
                        accept="image/*"
                        id="review-upload-photos"
                        type="file"
                        multiple
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            if (e.target.files && e.target.files.length > 0) {
                                const fileArray = Array.from(e.target.files);
                                let finalFiles: File[];
                                
                                if (fileArray.length + uploadedImages.length > MAX_IMAGES) {
                                    showAlert(`최대 ${MAX_IMAGES}개의 이미지만 업로드할 수 있습니다.`, 'warning');
                                    const remainingSlots = MAX_IMAGES - uploadedImages.length;
                                    finalFiles = fileArray.slice(0, remainingSlots);
                                } else {
                                    finalFiles = fileArray;
                                }
                                
                                const newFiles = [...uploadedImages, ...finalFiles];
                                setUploadedImages(newFiles);
                                
                                const newUrls = finalFiles.map(file => URL.createObjectURL(file));
                                setImagePreviewUrls([...imagePreviewUrls, ...newUrls]);
                            }
                        }}
                        style={{ display: "none" }}
                    />
                    
                    {imagePreviewUrls.length === 0 ? (
                        <label htmlFor="review-upload-photos" style={{ display: "inline-block", cursor: "pointer" }}>
                            <Box
                                sx={{
                                    width: 180,
                                    height: 150,
                                    bgcolor: "#ddd",
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    borderRadius: 1,
                                    "&:hover": { bgcolor: "#ccc" },
                                }}
                            >
                                <Typography fontSize="2rem">＋</Typography>
                            </Box>
                        </label>
                    ) : (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                            {imagePreviewUrls.map((url, index) => (
                                <Box key={index} sx={{ position: 'relative' }}>
                                    <Avatar
                                        src={url}
                                        variant="rounded"
                                        sx={{ width: 100, height: 100 }}
                                    />
                                    <Button
                                        size="small"
                                        sx={{
                                            position: 'absolute',
                                            top: -10,
                                            right: -10,
                                            minWidth: '24px',
                                            width: '24px',
                                            height: '24px',
                                            borderRadius: '50%',
                                            bgcolor: 'rgba(0,0,0,0.6)',
                                            color: 'white',
                                            p: 0,
                                            '&:hover': { bgcolor: 'rgba(0,0,0,0.8)' }
                                        }}
                                        onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                                            e.preventDefault();
                                            const newUrls = [...imagePreviewUrls];
                                            newUrls.splice(index, 1);
                                            setImagePreviewUrls(newUrls);
                                            
                                            const newFiles = [...uploadedImages];
                                            newFiles.splice(index, 1);
                                            setUploadedImages(newFiles);
                                        }}
                                    >
                                        ×
                                    </Button>
                                </Box>
                            ))}
                        
                            {imagePreviewUrls.length < MAX_IMAGES && (
                                <label htmlFor="review-upload-photos" style={{ display: "inline-block", cursor: "pointer" }}>
                                    <Box
                                        sx={{
                                            width: 100,
                                            height: 100,
                                            bgcolor: "#ddd",
                                            display: "flex",
                                            justifyContent: "center",
                                            alignItems: "center",
                                            borderRadius: 1,
                                            "&:hover": { bgcolor: "#ccc" },
                                        }}
                                    >
                                        <Typography fontSize="1.5rem">＋</Typography>
                                    </Box>
                                </label>
                            )}
                        </Box>
                    )}
                </Box>

                <TextField
                    fullWidth
                    multiline
                    rows={4}
                    variant="outlined"
                    label="Your Review"
                    onChange={(e) => {
                        // 입력된 텍스트가 MAX_CHARS를 초과하지 않도록 제한
                        if (e.target.value.length <= MAX_CHARS) {
                            setReviewText(e.target.value);
                        }
                    }}
                    value={reviewText}
                    helperText={`${reviewText.length}/${MAX_CHARS}`}
                    inputProps={{ maxLength: MAX_CHARS }}
                    sx={{ 
                        marginBottom: 2,
                        '& .MuiOutlinedInput-root': {
                            '& fieldset': { borderColor: '#FF9080' },
                            '&:hover fieldset': { borderColor: '#FF9080' },
                            '&.Mui-focused fieldset': { borderColor: '#FF9080' },
                        },
                        '& .MuiInputLabel-root': {
                            color: '#FF9080',
                        },
                        '& .MuiInputLabel-root.Mui-focused': {
                            color: '#FF9080',
                        },
                        '& .MuiInputBase-inputMultiline': {
                            overflow: 'hidden',
                        },
                        '& .MuiFormHelperText-root': {
                            textAlign: 'right',
                            marginRight: 1,
                        },
                    }}
                />

                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2, mb: 12 }}>
                    {tagOptions.map((tag) => (
                        <Paper
                            key={tag}
                            sx={{
                                display: 'inline-flex',
                                borderRadius: '20px',
                                border: '1px solid #ff9f9f',
                                bgcolor: selectedTags.includes(tag) ? '#ffeded' : 'transparent',
                                p: 0,
                                overflow: 'hidden',
                            }}
                        >
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={selectedTags.includes(tag)}
                                        onChange={() => handleTagToggle(tag)}
                                        sx={{ display: 'none' }}
                                    />
                                }
                                label={tag}
                                sx={{
                                    m: 0,
                                    py: 0.5,
                                    px: 2,
                                    color: '#ff9f9f',
                                    '&:hover': { bgcolor: '#fff0f0' },
                                }}
                            />
                        </Paper>
                    ))}
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                    <Button 
                        variant="contained"
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        sx={{
                            borderRadius: '8px',
                            fontWeight: 'bold',
                            paddingX: 4,
                            paddingY: 1.5,
                            fontSize: '16px',
                            textTransform: 'none',
                            backgroundColor: '#ff9f9f',
                            border: '1px solid #ff9f9f',
                            color: 'white',
                            '&:hover': {
                                backgroundColor: '#FF9080', 
                                borderColor: '#FF9080',
                                color: 'white'
                            },
                            '&:active': {
                                backgroundColor: '#ff9f9f',
                                borderColor: '#ff9f9f',
                                color: 'white'
                            }
                        }}
                    >
                        {isSubmitting ? (
                            <CircularProgress size={24} color="inherit" />
                        ) : (
                            'Submit Review'
                        )}
                    </Button>
                </Box>
            </Box>
            
            {/* 알림 컴포넌트 */}
            <Snackbar 
                open={alertOpen} 
                autoHideDuration={5000} 
                onClose={handleAlertClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert 
                    onClose={handleAlertClose} 
                    severity={alertSeverity} 
                    sx={{ width: '100%' }}
                >
                    {alertMessage}
                </Alert>
            </Snackbar>
        </Paper>
    );
}