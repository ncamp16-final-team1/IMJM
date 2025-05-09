package com.IMJM.admin.service;

import com.IMJM.admin.dto.AdminReviewDto;
import com.IMJM.admin.dto.ReviewDetailDto;
import com.IMJM.admin.dto.ReviewReplyDto;
import com.IMJM.admin.repository.ReviewReplyRepository;
import com.IMJM.admin.repository.SalonRepository;
import com.IMJM.common.entity.Review;
import com.IMJM.common.entity.ReviewPhotos;
import com.IMJM.common.entity.ReviewReply;
import com.IMJM.salon.repository.ReviewPhotosRepository;
import com.IMJM.salon.repository.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class AdminReviewService {

    private final ReviewReplyRepository reviewReplyRepository;
    private final ReviewRepository reviewRepository;
    private final ReviewPhotosRepository reviewPhotosRepository;

    public List<AdminReviewDto> getReviewList(String salonId) {

        List<Review> reviews = reviewRepository.findAllBySalonIdOrderByRegDateDesc(salonId);

        return reviews.stream()
                .map(review -> AdminReviewDto.builder()
                        .reviewId(review.getId())
                        .regDate(review.getRegDate())
                        .userName(review.getUser().getLastName() + " " + review.getUser().getFirstName())
                        .nickName(review.getUser().getNickname())
                        .answered(review.getReviewReply() != null)
                        .build())
                .collect(Collectors.toList());
    }

    public void reviewReply(Long reviewId, String content) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found"));

        ReviewReply reviewReply = ReviewReply.builder()
                .review(review)
                .content(content)
                .createdAt(OffsetDateTime.now())
                .build();
        reviewReplyRepository.save(reviewReply);
    }

    public ReviewDetailDto getReviewDetail(Long reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found"));

        ReviewReply reviewReply = reviewReplyRepository.findByReviewId(reviewId);

        List<ReviewPhotos> reviewPhotos = reviewPhotosRepository.findByReviewId(reviewId);

        if (reviewReply != null) {
            System.out.println(reviewReply.getContent());
        }

        List<String> photoUrls = reviewPhotos.stream()
                .map(ReviewPhotos::getPhotoUrl)
                .collect(Collectors.toList());

        return ReviewDetailDto.builder()
                .id(reviewId)
                .userName(review.getUser().getLastName() + " " + review.getUser().getFirstName())
                .stylistName(review.getReservation().getStylist().getName())
                .visitDate(review.getReservation().getReservationDate())
                .visitTime(review.getReservation().getReservationTime())
                .serviceName(review.getReservation().getReservationServiceName())
                .score(review.getScore())
                .content(review.getContent())
                .photoUrls(photoUrls)
                .reviewTag(review.getReviewTag())
                .reviewReply(reviewReply != null ? reviewReply.getContent() : null)
                .build();
    }

    @Transactional
    public void updateReviewReply(ReviewReplyDto reviewReplyDto) {
        ReviewReply reviewReply = reviewReplyRepository.findByReviewId(reviewReplyDto.getReviewId());
        if (reviewReply != null) {
            reviewReply.updateReviewReply(reviewReplyDto.getContent());
        }
    }

    public void deleteReviewReply(Long reviewId) {
        reviewReplyRepository.deleteByReviewId(reviewId);
    }
}
