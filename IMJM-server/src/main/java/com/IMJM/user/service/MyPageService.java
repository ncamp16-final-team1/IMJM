package com.IMJM.user.service;

import com.IMJM.admin.repository.ReservationCouponRepository;
import com.IMJM.admin.repository.ReviewReplyRepository;
import com.IMJM.admin.repository.SalonPhotosRepository;
import com.IMJM.admin.repository.SalonRepository;
import com.IMJM.common.cloud.NCPObjectStorageService;
import com.IMJM.common.entity.*;
import com.IMJM.reservation.repository.PaymentRepository;
import com.IMJM.reservation.repository.PointUsageRepository;
import com.IMJM.reservation.repository.ReservationRepository;
import com.IMJM.salon.repository.ReviewPhotosRepository;
import com.IMJM.salon.repository.ReviewRepository;
import com.IMJM.user.dto.*;
import com.IMJM.user.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.log4j.Log4j2;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Log4j2
@Service
@RequiredArgsConstructor
public class MyPageService {

    private final ReservationRepository reservationRepository;
    private final ReviewPhotosRepository reviewPhotosRepository;
    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;
    private final NCPObjectStorageService storageService;
    private final SalonRepository salonRepository;
    private final PaymentRepository paymentRepository;
    private final PointUsageRepository pointUsageRepository;
    private final ReservationCouponRepository reservationCouponRepository;
    private final ReviewReplyRepository reviewReplyRepository;
    private final SalonPhotosRepository salonPhotosRepository;

    @Value("${ncp.bucket-name}")
    private String bucketName;

    @Transactional(readOnly = true)
    public List<UserReservationResponseDto> getUserReservations(String userId) {
        List<Reservation> reservations = reservationRepository.findByUser_IdOrderByReservationDateDesc(userId);

        return reservations.stream()
                .map(this::convertToReservationDto)
                .collect(Collectors.toList());
    }

    private UserReservationResponseDto convertToReservationDto(Reservation reservation) {

        Payment payment = paymentRepository.findByReservationId(reservation.getId()).orElse(null);

        boolean hasReview = reviewRepository.existsByReservationId(reservation.getId());

        String salonPhotoUrl = salonPhotosRepository.findBySalon_IdOrderByPhotoOrderAsc(
                        reservation.getStylist().getSalon().getId()
                )
                .stream()
                .findFirst()
                .map(SalonPhotos::getPhotoUrl)
                .orElse("기본이미지URL");

        return UserReservationResponseDto.builder()
                .reservationId(reservation.getId())
                .reservationDate(reservation.getReservationDate())
                .reservationTime(reservation.getReservationTime())
                .serviceName(reservation.getReservationServiceName())
                .serviceType(reservation.getReservationServiceType())
                .price(reservation.getReservationPrice())
                .isPaid(reservation.isPaid())
                .salonId(reservation.getStylist().getSalon().getId())
                .salonName(reservation.getStylist().getSalon().getName())
                .salonAddress(reservation.getStylist().getSalon().getAddress())
                .salonScore(reservation.getStylist().getSalon().getScore())
                .salonPhotoUrl(salonPhotoUrl)
                .stylistName(reservation.getStylist().getName())
                .reviewCount(getReviewCount(reservation.getStylist().getSalon().getId()))
                .isReviewed(hasReview)
                .reviewId(hasReview ? getReviewId(reservation.getId(), reservation.getUser().getId()) : null)
                .paymentMethod(payment != null ? payment.getPaymentMethod() : null)
                .build();
    }

    private long getReviewCount(String salonId) {
        return reviewRepository.countBySalonId(salonId);
    }

    private Long getReviewId(Long reservationId, String userId) {
        return reviewRepository.findByReservationIdAndUserId(reservationId, userId)
                .map(Review::getId)
                .orElse(null);
    }


    @Transactional
    public Long saveReview(ReviewSaveRequestDto requestDto, List<MultipartFile> images) {
        if (images == null) {
            images = new ArrayList<>();
        }

        Users user = userRepository.findById(requestDto.getUserId())
                .orElseThrow(() -> new EntityNotFoundException("사용자를 찾을 수 없습니다."));

        Salon salon = salonRepository.findById(requestDto.getSalonId())
                .orElseThrow(() -> new EntityNotFoundException("미용실을 찾을 수 없습니다."));

        Reservation reservation = null;
        if (requestDto.getReservationId() != null) {
            reservation = reservationRepository.findById(requestDto.getReservationId())
                    .orElseThrow(() -> new EntityNotFoundException("예약 정보를 찾을 수 없습니다."));
        }

        String reviewTag = processReviewTags(requestDto.getTags());

        Review review = Review.builder()
                .user(user)
                .salon(salon)
                .reservation(reservation)
                .score(BigDecimal.valueOf(requestDto.getRating()))
                .content(requestDto.getReviewText())
                .reviewTag(reviewTag)
                .regDate(LocalDateTime.now())
                .build();

        Review savedReview = reviewRepository.save(review);

        if (images != null && !images.isEmpty()) {
            saveReviewImages(savedReview, images);
        }

        int pointsToGive = 10;
        user.savePoint(pointsToGive);
        userRepository.save(user);

        PointUsage pointUsage = PointUsage.builder()
                .user(user)
                .usageType("SAVE")
                .price(pointsToGive)
                .useDate(LocalDateTime.now())
                .content(salon.getName() + " 리뷰 작성")
                .build();

        pointUsageRepository.save(pointUsage);

        updateSalonScore(salon.getId());

        return savedReview.getId();
    }

    private void saveReviewImages(Review review, List<MultipartFile> images) {
        List<ReviewPhotos> reviewPhotos = new ArrayList<>();

        for (int i = 0; i < images.size(); i++) {
            MultipartFile image = images.get(i);

            String photoUrl = uploadReviewImageToStorage(review.getId(), image);

            ReviewPhotos reviewPhoto = ReviewPhotos.builder()
                    .review(review)
                    .photoUrl(photoUrl)
                    .photoOrder(i)
                    .uploadDate(LocalDateTime.now())
                    .build();

            reviewPhotos.add(reviewPhoto);
        }

        reviewPhotosRepository.saveAll(reviewPhotos);
    }

    private String uploadReviewImageToStorage(Long reviewId, MultipartFile image) {
        try {
            String originalFilename = image.getOriginalFilename();
            String extension = extractFileExtension(originalFilename);

            String uuid = UUID.randomUUID().toString();
            String newFilename = createReviewImagePath(reviewId, uuid, extension);

            storageService.upload(newFilename, image.getInputStream());

            return getFullImageUrl(newFilename);

        } catch (IOException e) {
            log.error("이미지 업로드 실패: {}", e.getMessage());
            throw new RuntimeException("이미지 업로드 중 오류가 발생했습니다: " + e.getMessage());
        }
    }

    private String extractFileExtension(String originalFilename) {
        if (originalFilename == null || !originalFilename.contains(".")) {
            throw new IllegalArgumentException("유효하지 않은 파일명입니다.");
        }

        String extension = originalFilename.substring(originalFilename.lastIndexOf(".")).toLowerCase();
        validateFileExtension(extension);

        return extension;
    }

    private void validateFileExtension(String ext) {
        List<String> allowedExtensions = Arrays.asList(".jpg", ".jpeg", ".png", ".gif", ".webp");
        if (!allowedExtensions.contains(ext)) {
            throw new IllegalArgumentException("지원되지 않는 파일 형식입니다.");
        }
    }

    private String createReviewImagePath(Long reviewId, String uuid, String extension) {
        return "reviews/" + reviewId + "/" + uuid + extension;
    }

    private String processReviewTags(List<String> tags) {
        if (tags == null || tags.isEmpty()) {
            return null;
        }

        String reviewTag = String.join(",", tags);
        return reviewTag.length() > 100
                ? reviewTag.substring(0, 100)
                : reviewTag;
    }

    @Transactional
    protected void updateSalonScore(String salonId) {
        Salon salon = salonRepository.findById(salonId)
                .orElseThrow(() -> new EntityNotFoundException("살롱을 찾을 수 없습니다."));

        Double averageScore = reviewRepository.findAverageRatingBySalonId(salon.getId())
                .orElse(0.0);

        salon.updateScore(averageScore);
    }

    private String getFullImageUrl(String s3Path) {
        String baseUrl = "https://" + bucketName + ".kr.object.ncloudstorage.com";
        return baseUrl + "/" + s3Path;
    }


    public UserReviewResponseDto getReviewWithPhotos(Long reviewId) {
        Review review = reviewRepository.findByReviewId(reviewId)
                .orElseThrow(() -> new IllegalArgumentException("리뷰를 찾을 수 없습니다."));

        List<ReviewPhotos> reviewPhotos = reviewPhotosRepository.findByReview_IdOrderByPhotoOrderAsc(reviewId);

        if (reviewPhotos.isEmpty()) {
            reviewPhotos = new ArrayList<>();
        }

        String reviewTag = review.getReviewTag();
        List<String> reviewTags = (reviewTag != null && !reviewTag.isEmpty())
                ? Arrays.asList(reviewTag.split(","))
                : new ArrayList<>();

        List<String> reviewPhotoUrls = reviewPhotos.stream()
                .map(ReviewPhotos::getPhotoUrl)
                .collect(Collectors.toList());

        return new UserReviewResponseDto(
                review.getId(),
                review.getUser().getId(),
                review.getReservation().getId(),
                review.getContent(),
                review.getScore(),
                review.getRegDate(),
                reviewTags,
                reviewPhotoUrls
        );
    }


    public ReservationDetailResponseDto getReservationDetail(Long reservationId) {

        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new EntityNotFoundException("예약 정보를 찾을 수 없습니다: " + reservationId));

        Payment payment = paymentRepository.findByReservationId(reservationId)
                .orElse(null);

        List<PointUsage> pointUsages = pointUsageRepository.findByUserId(reservation.getUser().getId());

        ReservationCoupon reservationCoupon = reservationCouponRepository.findByReservationId(reservationId)
                .orElse(null);

        String salonPhotoUrl = getSalonPhotoUrl(reservation.getStylist().getSalon());

        return buildReservationDetailResponseDto(reservation, payment, pointUsages, reservationCoupon, salonPhotoUrl);
    }

    private String getSalonPhotoUrl(Salon salon) {

        List<SalonPhotos> salonPhotos = salonPhotosRepository.findBySalon(salon);

        if (salonPhotos.isEmpty()) {
            return null;
        }

        return salonPhotos.get(0).getPhotoUrl();
    }

    private ReservationDetailResponseDto buildReservationDetailResponseDto(
            Reservation reservation,
            Payment payment,
            List<PointUsage> pointUsages,
            ReservationCoupon reservationCoupon,
            String salonPhotoUrl) {

        return ReservationDetailResponseDto.builder()
                .reservationId(reservation.getId())
                .reservationDate(reservation.getReservationDate())
                .reservationTime(reservation.getReservationTime())
                .serviceName(reservation.getReservationServiceName())
                .serviceType(reservation.getReservationServiceType())
                .price(reservation.getReservationPrice())
                .requirements(reservation.getRequirements())
                .salonName(reservation.getStylist().getSalon().getName())
                .salonAddress(reservation.getStylist().getSalon().getAddress())
                .salonPhotoUrl(salonPhotoUrl) // 매장 사진 URL
                .stylistName(reservation.getStylist().getName())
                .paymentInfo(payment != null ? mapToPaymentInfoDto(payment) : null)
                .couponInfo(reservationCoupon != null ? mapToCouponInfoDto(reservationCoupon) : null)
                .pointUsage(findRelevantPointUsage(pointUsages, reservation))
                .build();
    }

    private ReservationDetailResponseDto.PaymentInfoDto mapToPaymentInfoDto(Payment payment) {
        if (payment == null) {
            return null;
        }

        return ReservationDetailResponseDto.PaymentInfoDto.builder()
                .paymentMethod(payment.getPaymentMethod())
                .paymentStatus(payment.getPaymentStatus())
                .paymentDate(payment.getPaymentDate())
                .isCanceled(payment.isCanceled())
                .canceledAmount(payment.getCanceledAmount())
                .price(payment.getPrice())
                .build();
    }

    private ReservationDetailResponseDto.PointUsageDto findRelevantPointUsage(List<PointUsage> pointUsages, Reservation reservation) {
        if (pointUsages == null || pointUsages.isEmpty()) {
            return null;
        }

        return pointUsages.stream()
                .findFirst()
                .map(pointUsage -> ReservationDetailResponseDto.PointUsageDto.builder()
                        .points(pointUsage.getPrice())
                        .useDate(pointUsage.getUseDate())
                        .content(pointUsage.getContent())
                        .build())
                .orElse(null);
    }

    private ReservationDetailResponseDto.CouponInfoDto mapToCouponInfoDto(ReservationCoupon reservationCoupon) {
        if (reservationCoupon == null) {
            return null;
        }

        Coupon coupon = reservationCoupon.getCoupon();

        return ReservationDetailResponseDto.CouponInfoDto.builder()
                .couponName(coupon.getName())
                .discountType(coupon.getDiscountType())
                .discountValue(coupon.getDiscountValue())
                .discountAmount(reservationCoupon.getDiscountAmount())
                .build();
    }


    public UserReviewReplyResponseDto getReviewReplyByReviewId(Long reviewId) {
        Optional<ReviewReply> reviewReply = reviewReplyRepository.findOptionalByReviewId(reviewId);

        return reviewReply.map(UserReviewReplyResponseDto::new)
                .orElse(null);
    }


    @Transactional
    public Long updateReview(Long reviewId, ReviewUpdateRequestDto requestDto, List<MultipartFile> newImages, List<String> imagesToDelete) {
        if (newImages == null) {
            newImages = new ArrayList<>();
        }
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        CustomOAuth2UserDto oAuth2UserDto = (CustomOAuth2UserDto) authentication.getPrincipal();
        String currentUserId = oAuth2UserDto.getId();

        Review review = reviewRepository.findByReviewId(reviewId)
                .orElseThrow(() -> new EntityNotFoundException("리뷰를 찾을 수 없습니다."));

        if (!review.getUser().getId().equals(currentUserId)) {
            throw new AccessDeniedException("본인이 작성한 리뷰만 수정할 수 있습니다.");
        }

        BigDecimal score = BigDecimal.valueOf(requestDto.getRating());
        String reviewTag = processReviewTags(requestDto.getTags());
        review.updateReview(score, requestDto.getReviewText(), reviewTag);

        if (imagesToDelete != null && !imagesToDelete.isEmpty()) {
            deleteReviewImages(review, imagesToDelete);
        }

        if (!newImages.isEmpty()) {
            saveReviewImages(review, newImages);
        }

        Review updatedReview = reviewRepository.save(review);

        updateSalonScore(review.getSalon().getId());

        return updatedReview.getId();
    }

    private void deleteReviewImages(Review review, List<String> imageUrls) {
        for (String imageUrl : imageUrls) {

            Optional<ReviewPhotos> photoOpt = reviewPhotosRepository.findByReviewIdAndPhotoUrl(review.getId(), imageUrl);

            if (photoOpt.isPresent()) {
                ReviewPhotos photo = photoOpt.get();

                try {
                    String filePath = extractFilePathFromUrl(imageUrl);
                    storageService.delete(filePath);
                } catch (Exception e) {
                    log.error("이미지 삭제 실패: {}", e.getMessage());
                }

                reviewPhotosRepository.delete(photo);
            }
        }

        List<ReviewPhotos> remainingPhotos = reviewPhotosRepository.findByReview_IdOrderByPhotoOrderAsc(review.getId());
        for (int i = 0; i < remainingPhotos.size(); i++) {
            ReviewPhotos photo = remainingPhotos.get(i);
            photo.updatePhotoOrder(i);
        }

        reviewPhotosRepository.saveAll(remainingPhotos);
    }

    private String extractFilePathFromUrl(String imageUrl) {
        String baseUrl = getBaseStorageUrl();
        return imageUrl.replace(baseUrl, "");
    }

    private String getBaseStorageUrl() {
        return "https://" + bucketName + ".kr.object.ncloudstorage.com/";
    }

}

