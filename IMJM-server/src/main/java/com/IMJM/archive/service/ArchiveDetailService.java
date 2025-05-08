package com.IMJM.archive.service;

import com.IMJM.archive.dto.ArchiveCommentDto;
import com.IMJM.archive.dto.ArchiveDetailDto;
import com.IMJM.archive.dto.ArchiveLikeDto;
import com.IMJM.archive.repository.ArchiveCommentRepository;
import com.IMJM.archive.repository.ArchiveLikeRepository;
import com.IMJM.archive.repository.ArchivePhotosRepository;
import com.IMJM.archive.repository.ArchiveRepository;
import com.IMJM.common.entity.Archive;
import com.IMJM.common.entity.ArchiveComment;
import com.IMJM.common.entity.ArchiveLike;
import com.IMJM.common.entity.ArchivePhotos;
import com.IMJM.common.entity.Users;
import com.IMJM.user.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ArchiveDetailService {

    private final ArchiveRepository archiveRepository;
    private final ArchivePhotosRepository archivePhotosRepository;
    private final ArchiveCommentRepository archiveCommentRepository;
    private final ArchiveLikeRepository archiveLikeRepository;
    private final UserRepository usersRepository;

    @Transactional(readOnly = true)
    public ArchiveDetailDto getArchiveDetail(Long archiveId, String userId) {
        Archive archive = archiveRepository.findById(archiveId)
                .orElseThrow(() -> new EntityNotFoundException("아카이브를 찾을 수 없습니다."));

        List<String> photoUrls = archivePhotosRepository.findByArchiveIdOrderByPhotoOrderAsc(archiveId)
                .stream()
                .map(ArchivePhotos::getPhotoUrl)
                .collect(Collectors.toList());

        List<ArchiveComment> rootComments = archiveCommentRepository.findRootCommentsByArchiveId(archiveId);
        List<ArchiveCommentDto> commentDtos = new ArrayList<>();

        for (ArchiveComment rootComment : rootComments) {
            List<ArchiveComment> childComments = archiveCommentRepository.findChildCommentsByParentId(rootComment.getId());
            List<ArchiveCommentDto> childCommentDtos = childComments.stream()
                    .map(child -> convertToCommentDto(child, new ArrayList<>()))
                    .collect(Collectors.toList());

            ArchiveCommentDto rootCommentDto = convertToCommentDto(rootComment, childCommentDtos);
            commentDtos.add(rootCommentDto);
        }

        long likeCount = archiveLikeRepository.countByArchiveId(archiveId);
        boolean isLiked = false;

        if (userId != null) {
            isLiked = archiveLikeRepository.existsByArchiveIdAndUserId(archiveId, userId);
        }

        return ArchiveDetailDto.builder()
                .id(archive.getId())
                .userId(archive.getUser().getId())
                .username(archive.getUser().getNickname())
                .content(archive.getContent())
                .service(archive.getService())
                .gender(archive.getGender())
                .color(archive.getColor())
                .length(archive.getLength())
                .profileUrl(archive.getUser().getProfile())
                .regDate(archive.getRegDate())
                .photoUrls(photoUrls)
                .comments(commentDtos)
                .likeCount(likeCount)
                .isLiked(isLiked)
                .build();
    }

    @Transactional
    public ArchiveCommentDto addComment(Long archiveId, String userId, String content, Long parentCommentId) {
        Archive archive = archiveRepository.findById(archiveId)
                .orElseThrow(() -> new EntityNotFoundException("아카이브를 찾을 수 없습니다."));

        Users user = usersRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("사용자를 찾을 수 없습니다."));

        ArchiveComment.ArchiveCommentBuilder commentBuilder = ArchiveComment.builder()
                .archive(archive)
                .user(user)
                .content(content)
                .regDate(OffsetDateTime.now());
        // 대댓글인 경우
        if (parentCommentId != null) {
            ArchiveComment parentComment = archiveCommentRepository.findById(parentCommentId)
                    .orElseThrow(() -> new EntityNotFoundException("부모 댓글을 찾을 수 없습니다."));

            if (!parentComment.getArchive().getId().equals(archiveId)) {
                throw new IllegalArgumentException("부모 댓글이 해당 아카이브의 댓글이 아닙니다.");
            }

            commentBuilder.parentComment(parentComment)
                    .isCommentForComment(true);
        } else {
            commentBuilder.isCommentForComment(false);
        }

        ArchiveComment savedComment = archiveCommentRepository.save(commentBuilder.build());
        return convertToCommentDto(savedComment, new ArrayList<>());
    }

    @Transactional
    public void deleteComment(Long commentId, String userId) {
        ArchiveComment comment = archiveCommentRepository.findById(commentId)
                .orElseThrow(() -> new EntityNotFoundException("댓글을 찾을 수 없습니다."));

        if (!comment.getUser().getId().equals(userId)) {
            throw new AccessDeniedException("해당 댓글에 대한 권한이 없습니다.");
        }

        List<ArchiveComment> childComments = archiveCommentRepository.findChildCommentsByParentId(commentId);
        if (!childComments.isEmpty()) {
            archiveCommentRepository.deleteAll(childComments);
        }

        archiveCommentRepository.delete(comment);
    }

    @Transactional
    public boolean toggleLike(Long archiveId, String userId) {
        Archive archive = archiveRepository.findById(archiveId)
                .orElseThrow(() -> new EntityNotFoundException("아카이브를 찾을 수 없습니다."));

        Users user = usersRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("사용자를 찾을 수 없습니다."));

        Optional<ArchiveLike> existingLike = archiveLikeRepository.findByArchiveIdAndUserId(archiveId, userId);

        if (existingLike.isPresent()) {
            archiveLikeRepository.delete(existingLike.get());
            return false;
        }
        else {
            ArchiveLike like = ArchiveLike.builder()
                    .archive(archive)
                    .user(user)
                    .build();

            archiveLikeRepository.save(like);
            return true;
        }
    }

    @Transactional(readOnly = true)
    public List<ArchiveLikeDto> getLikes(Long archiveId) {
        List<ArchiveLike> likes = archiveLikeRepository.findByArchiveId(archiveId);

        return likes.stream()
                .map(like -> ArchiveLikeDto.builder()
                        .archiveId(like.getArchive().getId())
                        .userId(like.getUser().getId())
                        .username(like.getUser().getNickname())
                        .build())
                .collect(Collectors.toList());
    }

    private ArchiveCommentDto convertToCommentDto(ArchiveComment comment, List<ArchiveCommentDto> childComments) {
        return ArchiveCommentDto.builder()
                .id(comment.getId())
                .archiveId(comment.getArchive().getId())
                .userId(comment.getUser().getId())
                .username(comment.getUser().getNickname())
                .profileUrl(comment.getUser().getProfile())
                .regDate(comment.getRegDate())
                .content(comment.getContent())
                .isCommentForComment(comment.isCommentForComment())
                .parentCommentId(comment.getParentComment() != null ? comment.getParentComment().getId() : null)
                .childComments(childComments)
                .build();
    }
}