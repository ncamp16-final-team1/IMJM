import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { 
  Box, 
  Typography,
  TextField, 
  Button, 
  Paper, 
  Stack,
  Divider,
  Avatar,
  Checkbox,
  FormControlLabel,
  Snackbar,
  Alert,
  CircularProgress,
  AlertColor,
  IconButton
} from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import StarHalfIcon from '@mui/icons-material/StarHalf';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import axios from 'axios';

interface LocationState {
  salonId: string;
  reservationId: number;
  salonName: string;
  salonScore?: string;
  reviewCount?: string;
  salonAddress?: string;
  reservationDate?: string;
  reservationTime?: string;
  price?: number;
  salonPhotoUrl?: string;
  serviceName?: string;
  stylistName?: string;
  isEdit?: boolean;
  reviewId?: number;
}

interface ReviewData {
  salonId: string;
  reservationId: number;
  rating: number;
  reviewText: string;
  tags: string[];
  reviewId?: number;
}

const MAX_IMAGES = 3;
const MAX_CHARS = 100;

const TAG_OPTIONS = [
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

interface RatingStarsProps {
  score: number;
  onChange: (newScore: number) => void;
}

const RatingStars = ({ score, onChange }: RatingStarsProps) => {
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  
  return (
    <Stack direction="row" alignItems="center" spacing={0.5}>
      {[1,2,3,4,5].map((star) => {
        const currentRating = hoverRating !== null ? hoverRating : score;
        const isFullStar = star <= currentRating;
        const isHalfStar = !isFullStar && star - 0.5 <= currentRating;
        
        const iconStyle = { 
          color: '#FFD700', 
          fontSize: 30,
          cursor: 'pointer'
        };

        return (
          <Box 
            key={star} 
            sx={{ 
              position: 'relative', 
              display: 'inline-flex',
              alignItems: 'center'
            }}
          >
            {isFullStar ? (
              <StarIcon sx={iconStyle} />
            ) : isHalfStar ? (
              <StarHalfIcon sx={iconStyle} />
            ) : (
              <StarBorderIcon sx={iconStyle} />
            )}
            
            <Box 
              sx={{ 
                position: 'absolute',
                left: 0,
                top: 0,
                width: '50%',
                height: '100%',
                cursor: 'pointer',
              }}
              onClick={() => onChange(star - 0.5)}
              onMouseEnter={() => setHoverRating(star - 0.5)}
              onMouseLeave={() => setHoverRating(null)}
            />
            
            <Box 
              sx={{ 
                position: 'absolute',
                right: 0,
                top: 0,
                width: '50%',
                height: '100%',
                cursor: 'pointer',
              }}
              onClick={() => onChange(star === score ? 0 : star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(null)}
            />
          </Box>
        );
      })}
    </Stack>
  );
};

export default function WriteOrEditReview() {
  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams();
  
  // State for edit mode
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [reviewId, setReviewId] = useState<number | undefined>(undefined);
  const [existingImageUrls, setExistingImageUrls] = useState<string[]>([]);
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);
  const [canGoBack, setCanGoBack] = useState<boolean>(false);

  const {
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
  } = (location.state as LocationState) || {};
  
  useEffect(() => {
    // Check if we came from another page (for back button functionality)
    if (location.key !== 'default') {
      setCanGoBack(true);
    }

    const locState = location.state as LocationState;
    if (locState?.isEdit && locState?.reviewId) {
      setIsEditMode(true);
      setReviewId(locState.reviewId);
      fetchExistingReview(locState.reviewId);
    } else if (locState?.reviewId) {
      // If there's a reviewId but isEdit is not set, check if we should be in edit mode
      // This handles navigation from the view review page
      setReviewId(locState.reviewId);
      fetchExistingReview(locState.reviewId);
      setIsEditMode(true);
    }
    
    // Alternative: detect edit mode from URL parameter
    if (params.reviewId && !isNaN(Number(params.reviewId))) {
      setIsEditMode(true);
      const id = Number(params.reviewId);
      setReviewId(id);
      fetchExistingReview(id);
    }
  }, [location.state, params.reviewId, location.key]);

  const [rating, setRating] = useState<number>(0);
  const [reviewText, setReviewText] = useState<string>('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [alertOpen, setAlertOpen] = useState<boolean>(false);
  const [alertMessage, setAlertMessage] = useState<string>('');
  const [alertSeverity, setAlertSeverity] = useState<AlertColor>('success');

  const fetchExistingReview = async (id: number) => {
    setIsLoading(true);
    try {
      // Similar endpoint to the one in ViewReview component
      const response = await axios.get(`/api/mypages/view-review`, {
        params: { reviewId: id }
      });
      
      const reviewData = response.data;
      
      // Populate form with existing data
      setRating(reviewData.score || 0);
      setReviewText(reviewData.reviewContent || reviewData.content || '');
      setSelectedTags(reviewData.reviewTags || []);
      
      // Handle existing images
      const imageUrls = reviewData.reviewPhotoUrls || [];
      setExistingImageUrls(imageUrls);
      setImagePreviewUrls(imageUrls);
    } catch (error) {
      console.error('리뷰 데이터를 불러오는 중 오류가 발생했습니다:', error);
      showAlert('리뷰 데이터를 불러오는 중 오류가 발생했습니다.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (timeString: string): string => {
    if (!timeString) return '';
    return timeString.substring(0, 5);
  };

  const showAlert = (message: string, severity: AlertColor = 'success'): void => {
    setAlertMessage(message);
    setAlertSeverity(severity);
    setAlertOpen(true);
  };
  
  const handleAlertClose = (): void => {
    setAlertOpen(false);
  };

  const handleRatingChange = (newRating: number): void => {
    setRating(newRating);
  };

  const handleTagToggle = (tag: string): void => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag) 
        : [...prev, tag]
    );
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>): void => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const fileArray = Array.from(e.target.files);
    let finalFiles: File[];
    
    // Calculate total images (existing + new)
    const totalImagesCount = imagePreviewUrls.length + fileArray.length;
    
    if (totalImagesCount > MAX_IMAGES) {
      showAlert(`최대 ${MAX_IMAGES}개의 이미지만 업로드할 수 있습니다.`, 'warning');
      const remainingSlots = MAX_IMAGES - imagePreviewUrls.length;
      finalFiles = fileArray.slice(0, remainingSlots);
    } else {
      finalFiles = fileArray;
    }
    
    const newFiles = [...uploadedImages, ...finalFiles];
    setUploadedImages(newFiles);
    
    const newUrls = finalFiles.map(file => URL.createObjectURL(file));
    setImagePreviewUrls([...imagePreviewUrls, ...newUrls]);
  };

  const handleRemoveImage = (index: number): void => {
    // Handle removal differently for existing vs new images
    const imageUrl = imagePreviewUrls[index];
    
    // Check if this is an existing image (from server)
    if (existingImageUrls.includes(imageUrl)) {
      setImagesToDelete(prev => [...prev, imageUrl]);
    }
    
    // Remove from preview
    const newUrls = [...imagePreviewUrls];
    newUrls.splice(index, 1);
    setImagePreviewUrls(newUrls);
    
    // If it's a new uploaded file, remove it from uploadedImages
    if (index < uploadedImages.length) {
      const newFiles = [...uploadedImages];
      newFiles.splice(index, 1);
      setUploadedImages(newFiles);
    }
  };

  const validateReview = (): boolean => {
    if (rating === 0) {
      showAlert('별점을 선택해주세요.', 'warning');
      return false;
    }
    
    if (reviewText.trim() === '') {
      showAlert('리뷰 내용을 입력해주세요.', 'warning');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (): Promise<void> => {
    if (!validateReview()) return;
    
    setIsSubmitting(true);
    
    const reviewData: ReviewData = {
      salonId,
      reservationId,
      rating,
      reviewText,
      tags: selectedTags,
    };
    
    // Add reviewId if in edit mode
    if (isEditMode && reviewId) {
      reviewData.reviewId = reviewId;
    }
    
    const formData = new FormData();
    formData.append('reviewData', new Blob([JSON.stringify(reviewData)], {type: 'application/json'}));
    
    // Add images to delete if in edit mode
    if (isEditMode && imagesToDelete.length > 0) {
      formData.append('imagesToDelete', new Blob([JSON.stringify(imagesToDelete)], {type: 'application/json'}));
    }
    
    // Add new images
    uploadedImages.forEach((image) => {
      formData.append('images', image);
    });
    
    try {
      const endpoint = isEditMode 
        ? `/api/mypages/review-update/${reviewId}`
        : '/api/mypages/review-save';
        
      await axios.post(endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 10000
      });

      showAlert(isEditMode 
        ? '리뷰가 성공적으로 수정되었습니다!' 
        : '리뷰가 성공적으로 제출되었습니다!');
      
      setTimeout(() => {
        // In edit mode, go back to review details page if possible
        if (isEditMode && reviewId) {
          navigate(`/my/review/${reviewId}`, {
            state: {
              ...location.state, // Preserve all state properties
              reviewId: reviewId
            }
          });
        } else {
          // For new reviews, go to appointments page
          navigate('/my/appointments');
        }
      }, 1500);
      
    } catch (error: any) { 
      console.error('리뷰 제출 중 오류 발생:', error);
      
      let errorMessage = '리뷰 제출 중 오류가 발생했습니다.';
      
      if (error.response) {
        if (error.response.status === 413) {
          errorMessage = '이미지 파일이 너무 큽니다. 더 작은 이미지를 선택해 주세요.';
        } else if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        }
      } else if (error.request) {
        errorMessage = '서버에 연결할 수 없습니다. 네트워크 연결을 확인해 주세요.';
      } else if (error.code === 'ECONNABORTED') {
        errorMessage = '서버 응답 시간이 초과되었습니다. 나중에 다시 시도해 주세요.';
      }
      
      showAlert(errorMessage, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleCancel = (): void => {
    // If in edit mode, go back to review details page
    if (isEditMode && reviewId) {
      navigate(`/my/view-review`, {
        state: {
          ...location.state,
          reviewId: reviewId
        }
      });
    } else {
      // For new reviews, go back to appointments page
      navigate('/my/appointments');
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress sx={{ color: '#FF9080' }} />
      </Box>
    );
  }
  
  return (
    <Paper elevation={0} sx={{ maxWidth: '100vw' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        {canGoBack && (
          <IconButton 
            onClick={() => navigate(-1)} 
            sx={{ mr: 1, color: '#FF9080' }}
          >
            <ArrowBackIcon />
          </IconButton>
        )}
        <Typography variant="h4" fontWeight="bold">
          {isEditMode ? '리뷰 수정하기' : '리뷰 작성하기'}
        </Typography>
      </Box>
      <Divider sx={{ marginY: 3, borderColor: 'grey.500', borderWidth: 2 }} />
      
      <Box sx={{ display: 'flex', mb: 3 }}>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h4" fontWeight="bold">{salonName}</Typography>
          
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 0.5 }}>
            <StarIcon sx={{ color: '#FFD700', fontSize: 30 }} />
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: 17 }}>
              {salonScore || "별점없음"} ({reviewCount || "리뷰없음"})
            </Typography>
          </Stack>
          
          <Typography variant="body2" sx={{ mt: 0.5 }}>{salonAddress}</Typography>
          
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 1, fontSize: 17 }}>
            {reservationDate} / {formatTime(reservationTime || '')}
          </Typography>
          
          <Typography variant="body2" color="text.secondary">
            스타일리스트 : {stylistName}
          </Typography>
          
          <Typography variant="body2" sx={{ mt: 0.5, fontWeight: 'bold' }}>
            {price?.toLocaleString()} KRW
          </Typography>
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
          {serviceName}
        </Typography>  
      </Box>

      <Divider sx={{ marginY: 2, borderColor: 'grey.500', borderWidth: 2 }} />

      <Box sx={{ marginTop: 3 }}>
        <Box sx={{ mb: 2 }}>
          <Typography variant="body1" sx={{ mb: 1 }}>별점을 선택해주세요</Typography>
          <RatingStars score={rating} onChange={handleRatingChange} />
        </Box>

        <Box sx={{ mb: 2 }}>
          <input
            accept="image/*"
            id="review-upload-photos"
            type="file"
            multiple
            onChange={handleImageUpload}
            style={{ display: "none" }}
          />
          
          {imagePreviewUrls.length === 0 ? (
            <ImageUploadButton />
          ) : (
            <ImagePreviewSection 
              imagePreviewUrls={imagePreviewUrls}
              onRemoveImage={handleRemoveImage}
              maxImages={MAX_IMAGES}
            />
          )}
        </Box>

        <ReviewTextField 
          reviewText={reviewText}
          setReviewText={setReviewText}
          maxChars={MAX_CHARS}
        />

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2, mb: 12 }}>
          {TAG_OPTIONS.map((tag) => (
            <TagCheckbox
              key={tag}
              tag={tag}
              selected={selectedTags.includes(tag)}
              onToggle={handleTagToggle}
            />
          ))}
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
          <Button 
            variant="outlined"
            onClick={handleCancel}
            disabled={isSubmitting}
            sx={{
              borderRadius: '8px',
              fontWeight: 'bold',
              paddingX: 4,
              paddingY: 1.5,
              fontSize: '16px',
              textTransform: 'none',
              backgroundColor: 'transparent',
              border: '1px solid #ff9f9f',
              color: '#ff9f9f',
              boxShadow: 'none',
              '&:hover': {
                backgroundColor: 'rgba(255, 159, 159, 0.1)',
                borderColor: '#FF9080',
                color: '#FF9080',
                boxShadow: 'none' 
              }
            }}
          >
            취소
          </Button>
          
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
              boxShadow: 'none',
              '&:hover': {
                backgroundColor: '#FF9080',
                borderColor: '#FF9080',
                color: 'white',
                boxShadow: 'none' 
              },
              '&:active': {
                backgroundColor: '#ff9f9f',
                borderColor: '#ff9f9f',
                color: 'white',
                boxShadow: 'none' 
              }
            }}
          >
            {isSubmitting ? <CircularProgress size={24} color="inherit" /> : isEditMode ? '수정 완료' : '리뷰 제출'}
          </Button>
        </Box>
      </Box>
      
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

const ImageUploadButton = () => (
  <label htmlFor="review-upload-photos" style={{ display: "inline-block", cursor: "pointer" }}>
    <Box
      sx={{
        width: 130,
        height: 110,
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
);

interface ImagePreviewSectionProps {
  imagePreviewUrls: string[];
  onRemoveImage: (index: number) => void;
  maxImages: number;
}

const ImagePreviewSection = ({ imagePreviewUrls, onRemoveImage, maxImages }: ImagePreviewSectionProps) => (
  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
    {imagePreviewUrls.map((url, index) => (
      <Box key={index} sx={{ position: 'relative' }}>
        <Avatar
          src={url}
          variant="rounded"
          sx={{ 
            width: 130, 
            height: 110, 
            objectFit: 'cover',
            border: url.startsWith('blob:') ? '2px solid #FF9080' : 'none' // Highlight new images
          }}
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
          onClick={(e) => {
            e.preventDefault();
            onRemoveImage(index);
          }}
        >
          ×
        </Button>
      </Box>
    ))}
  
    {imagePreviewUrls.length < maxImages && (
      <label htmlFor="review-upload-photos" style={{ display: "inline-block", cursor: "pointer" }}>
        <Box
          sx={{
            width: 130,
            height: 110,
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
);

interface ReviewTextFieldProps {
  reviewText: string;
  setReviewText: (text: string) => void;
  maxChars: number;
}

const ReviewTextField = ({ reviewText, setReviewText, maxChars }: ReviewTextFieldProps) => (
  <TextField
    fullWidth
    multiline
    rows={4}
    variant="outlined"
    label="Your Review"
    onChange={(e) => {
      if (e.target.value.length <= maxChars) {
        setReviewText(e.target.value);
      }
    }}
    value={reviewText}
    helperText={`${reviewText.length}/${maxChars}`}
    inputProps={{ maxLength: maxChars }}
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
);

interface TagCheckboxProps {
  tag: string;
  selected: boolean;
  onToggle: (tag: string) => void;
}

const TagCheckbox = ({ tag, selected, onToggle }: TagCheckboxProps) => (
  <Paper
    elevation={0}
    sx={{
      display: 'inline-flex',
      borderRadius: '20px',
      border: '1px solid #ff9f9f',
      bgcolor: selected ? '#ffeded' : 'transparent',
      p: 0,
      overflow: 'hidden',
    }}
  >
    <FormControlLabel
      control={
        <Checkbox
          checked={selected}
          onChange={() => onToggle(tag)}
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
);