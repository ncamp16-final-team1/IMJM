import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Container,
    Paper,
    Typography,
    Box,
    CircularProgress,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    DialogContentText,
    IconButton,
    TextField,
    Avatar,
    List,
    ListItem,
    ListItemAvatar,
    Menu,
    MenuItem
} from '@mui/material';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import SendIcon from '@mui/icons-material/Send';
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import MoreVertIcon from '@mui/icons-material/MoreVert';

interface ArchiveDetailData {
    id: number;
    userId: string;
    username: string;
    firstName: string;
    lastName: string;
    profileUrl: string;
    content: string;
    regDate: string;
    photoUrls: string[];
    likeCount: number;
    isLiked: boolean;
    comments: CommentData[];
}

interface CommentData {
    id: number;
    archiveId: number;
    userId: string;
    username: string;
    profileUrl: string;
    content: string;
    regDate: string;
    isCommentForComment: boolean;
    parentCommentId: number | null;
    childComments: CommentData[];
}

function ArchiveDetail() {
    const { id } = useParams<{ id?: string }>();
    const navigate = useNavigate();

    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [archive, setArchive] = useState<ArchiveDetailData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [openDialog, setOpenDialog] = useState<boolean>(false);
    const [currentImage, setCurrentImage] = useState<string>('');
    const [commentOpen, setCommentOpen] = useState<boolean>(false);
    const [newComment, setNewComment] = useState<string>('');
    const [replyTo, setReplyTo] = useState<number | null>(null);
    const [replyContent, setReplyContent] = useState<string>('');
    const [activeStep, setActiveStep] = useState<number>(0);
    const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
    const menuOpen = Boolean(menuAnchorEl);
    const [isLiked, setIsLiked] = useState<boolean>(false);
    const [, setLikeCount] = useState<number>(0);


    // 현재 사용자 정보 가져오기
    const fetchCurrentUser = async () => {
        try {
            const response = await fetch('/api/archive/current-user', {
                credentials: 'include'
            });

            if (response.ok) {
                const userData = await response.json();
                setCurrentUserId(userData.userId);
            }
        } catch (error) {
            console.error('현재 사용자 정보 가져오기 실패:', error);
        }
    };

    // 아카이브 상세 정보 가져오기
    const fetchArchiveDetail = async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/archive/${id}`, {
                credentials: 'include' // 쿠키 포함 (인증 정보)
            });

            if (!response.ok) {
                throw new Error('아카이브를 불러오는데 실패했습니다.');
            }

            const data = await response.json();
            console.log(data)
            setArchive(data);
            setIsLiked(data.liked);
            setLikeCount(data.likeCount);
        } catch (err) {
            console.error('아카이브 상세 조회 오류:', err);
            setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // 컴포넌트 마운트 시 현재 사용자 정보 가져오기
        fetchCurrentUser();

        if (id) {
            fetchArchiveDetail();
        }
    }, [id]);

    const handleImageClick = (imageUrl: string) => {
        setCurrentImage(imageUrl);
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
    };

    const handleBack = () => {
        navigate(-1);
    };

    const handleNext = () => {
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
    };

    const handlePrev = () => {
        setActiveStep((prevActiveStep) => prevActiveStep - 1);
    };

    const handleMenuOpen = (event: any) => {
        setMenuAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setMenuAnchorEl(null);
    };

    const handleEdit = () => {
        handleMenuClose();
        navigate(`/archive/edit/${id}`);
    };

    const handleDeleteClick = () => {
        handleMenuClose();
        setDeleteDialogOpen(true);
    };

    const handleDeleteCancel = () => {
        setDeleteDialogOpen(false);
    };

    const handleDeleteConfirm = async () => {
        try {
            const response = await fetch(`/api/archive/${id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include' // 쿠키 포함 (인증 정보)
            });

            if (!response.ok) {
                throw new Error('아카이브 삭제에 실패했습니다.');
            }

            navigate('/archive', { replace: true });
        } catch (err) {
            console.error('아카이브 삭제 오류:', err);
            alert('아카이브 삭제 중 오류가 발생했습니다.');
        } finally {
            setDeleteDialogOpen(false);
        }
    };

    const handleLikeToggle = async () => {
        if (!archive) return;

        try {
            const response = await fetch(`/api/archive/${id}/like`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include'
            });

            if (!response.ok) throw new Error('좋아요 처리에 실패했습니다.');

            const data = await response.json();
            setIsLiked(data.liked);
            setLikeCount(prev => data.liked ? prev + 1 : prev - 1);

            setArchive(prev => prev ? {
                ...prev,
                isLiked: data.liked,
                likeCount: data.liked ? prev.likeCount + 1 : prev.likeCount - 1
            } : null);

        } catch (err) {
            console.error('좋아요 오류:', err);
        }
    };


    const handleCommentToggle = () => {
        setCommentOpen(!commentOpen);
        // 댓글을 토글할 때 답글 입력 상태 초기화
        setReplyTo(null);
    };

    const handleAddComment = async () => {
        if (!newComment.trim() || !archive) return;

        try {
            const response = await fetch(`/api/archive/${id}/comments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    content: newComment,
                    parentCommentId: null
                }),
                credentials: 'include' // 쿠키 포함 (인증 정보)
            });

            if (!response.ok) {
                throw new Error('댓글 등록에 실패했습니다.');
            }

            const commentData = await response.json();
            setArchive(prev => prev ? {
                ...prev,
                comments: [...prev.comments, commentData]
            } : null);
            setNewComment('');
        } catch (err) {
            console.error('댓글 등록 오류:', err);
        }
    };

    // 댓글 엔터키 처리를 위한 핸들러 추가
    const handleCommentKeyDown = (event: React.KeyboardEvent) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault(); // 기본 엔터키 동작 방지
            handleAddComment();
        }
    };

    const handleReply = async (commentId: number) => {
        if (!replyContent.trim() || !archive) return;

        try {
            const response = await fetch(`/api/archive/${id}/comments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    content: replyContent,
                    parentCommentId: commentId
                }),
                credentials: 'include' // 쿠키 포함 (인증 정보)
            });

            if (!response.ok) {
                throw new Error('답글 등록에 실패했습니다.');
            }

            const replyData = await response.json();

            setArchive(prev => {
                if (!prev) return null;

                const updatedComments = prev.comments.map(comment => {
                    if (comment.id === commentId) {
                        return {
                            ...comment,
                            childComments: [...(comment.childComments || []), replyData]
                        };
                    }
                    return comment;
                });

                return {
                    ...prev,
                    comments: updatedComments
                };
            });

            setReplyTo(null);
            setReplyContent('');
        } catch (err) {
            console.error('답글 등록 오류:', err);
        }
    };

    // 답글 엔터키 처리를 위한 핸들러 추가
    const handleReplyKeyDown = (event: React.KeyboardEvent) => {
        if (event.key === 'Enter' && !event.shiftKey && replyTo) {
            event.preventDefault(); // 기본 엔터키 동작 방지
            handleReply(replyTo);
        }
    };

    const handleDeleteComment = async (commentId: number) => {
        try {
            const response = await fetch(`/api/archive/comments/${commentId}`, {
                method: 'DELETE',
                credentials: 'include' // 쿠키 포함 (인증 정보)
            });

            if (!response.ok) {
                throw new Error('댓글 삭제에 실패했습니다.');
            }

            setArchive(prev => {
                if (!prev) return null;

                const updatedComments = prev.comments.map(comment => {
                    if (comment.id === commentId) {
                        return null;
                    }

                    if (comment.childComments) {
                        return {
                            ...comment,
                            childComments: comment.childComments.filter(child => child.id !== commentId)
                        };
                    }

                    return comment;
                }).filter(Boolean) as CommentData[];

                return {
                    ...prev,
                    comments: updatedComments
                };
            });
        } catch (err) {
            console.error('댓글 삭제 오류:', err);
        }
    };

    const handleReplyClick = (commentId: number) => {
        // 이미 같은 댓글에 대한 답글 입력중이라면 취소
        if (replyTo === commentId) {
            setReplyTo(null);
        } else {
            setReplyTo(commentId);
        }
    };

    const formatRelativeTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (diffInSeconds < 60) return "방금 전";

        const diffInMinutes = Math.floor(diffInSeconds / 60);
        if (diffInMinutes < 60) return `${diffInMinutes}분 전`;

        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `${diffInHours}시간 전`;

        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays < 7) return `${diffInDays}일 전`;

        return date.toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <Container fixed maxWidth="md" sx={{ mt: 4, mb: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                <CircularProgress />
            </Container>
        );
    }

    if (error) {
        return (
            <Container fixed maxWidth="md" sx={{ mt: 4, mb: 4 }}>
                <Paper elevation={0} sx={{ p: 4, backgroundColor: '#FDF6F3', border: '1px solid #dbdbdb' }}>
                    <Box bgcolor="#ffebee" p={3} borderRadius={1} mb={4}>
                        <Typography color="error">{error}</Typography>
                    </Box>
                    <Button onClick={handleBack} variant="outlined">돌아가기</Button>
                </Paper>
            </Container>
        );
    }

    if (!archive) {
        return (
            <Container fixed maxWidth="md" sx={{ mt: 4, mb: 4 }}>
                <Paper elevation={0} sx={{ p: 4, backgroundColor: '#FDF6F3', border: '1px solid #dbdbdb' }}>
                    <Typography variant="h6" align="center">아카이브를 찾을 수 없습니다.</Typography>
                    <Box mt={3} display="flex" justifyContent="center">
                        <Button onClick={handleBack} variant="outlined">돌아가기</Button>
                    </Box>
                </Paper>
            </Container>
        );
    }

    return (
        <Container fixed maxWidth="md" sx={{ mt: 4, mb: 4 }}>
            <Paper elevation={0} sx={{ borderRadius: 2, overflow: 'hidden', border: '1px solid #dbdbdb' }}>
                {/* 작성자 정보 헤더 */}
                <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #efefef' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ mr: 2 }}>
                            {archive.profileUrl ?
                                <img src={archive.profileUrl} alt={archive.username} style={{ width: '100%', height: '100%' }} /> :
                                archive.username?.charAt(0)}
                        </Avatar>
                        <Typography component="span" fontWeight="bold">
                            {archive.username}
                        </Typography>
                    </Box>

                    {/* 게시물 작성자일 경우에만 메뉴 표시 */}
                    {archive.userId === currentUserId && (
                        <Box>
                            <IconButton
                                aria-label="더보기"
                                onClick={handleMenuOpen}
                            >
                                <MoreVertIcon />
                            </IconButton>
                            <Menu
                                id="archive-menu"
                                anchorEl={menuAnchorEl}
                                open={menuOpen}
                                onClose={handleMenuClose}
                            >
                                <MenuItem onClick={handleEdit}>수정</MenuItem>
                                <MenuItem onClick={handleDeleteClick} sx={{ color: 'error.main' }}>삭제</MenuItem>
                            </Menu>
                        </Box>
                    )}
                </Box>

                {/* 이미지 슬라이더 */}
                {archive.photoUrls && archive.photoUrls.length > 0 && (
                    <Box sx={{ position: 'relative' }}>
                        <Box
                            onClick={() => handleImageClick(archive.photoUrls[activeStep])}
                            sx={{
                                position: 'relative',
                                paddingTop: '100%', // 1:1 비율 유지
                                cursor: 'pointer',
                                overflow: 'hidden'
                            }}
                        >
                            <Box
                                component="img"
                                src={archive.photoUrls[activeStep]}
                                alt={`이미지 ${activeStep + 1}`}
                                sx={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'cover'
                                }}
                            />
                        </Box>

                        {/* 이미지가 2개 이상일 때만 화살표 버튼 표시 */}
                        {archive.photoUrls.length > 1 && (
                            <>
                                {/* 왼쪽 화살표 */}
                                <IconButton
                                    sx={{
                                        position: 'absolute',
                                        top: '50%',
                                        left: 8,
                                        transform: 'translateY(-50%)',
                                        bgcolor: 'rgba(255, 255, 255, 0.8)',
                                        '&:hover': {
                                            bgcolor: 'rgba(255, 255, 255, 0.9)',
                                        }
                                    }}
                                    size="small"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handlePrev();
                                    }}
                                    disabled={activeStep === 0}
                                >
                                    <KeyboardArrowLeft />
                                </IconButton>

                                {/* 오른쪽 화살표 */}
                                <IconButton
                                    sx={{
                                        position: 'absolute',
                                        top: '50%',
                                        right: 8,
                                        transform: 'translateY(-50%)',
                                        bgcolor: 'rgba(255, 255, 255, 0.8)',
                                        '&:hover': {
                                            bgcolor: 'rgba(255, 255, 255, 0.9)',
                                        }
                                    }}
                                    size="small"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleNext();
                                    }}
                                    disabled={activeStep === archive.photoUrls.length - 1}
                                >
                                    <KeyboardArrowRight />
                                </IconButton>
                            </>
                        )}
                    </Box>
                )}

                {/* 액션 버튼 */}
                <Box sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
                    <IconButton onClick={handleLikeToggle} color={isLiked ? "error" : "default"}>
                        {isLiked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                    </IconButton>
                    <IconButton onClick={handleCommentToggle}>
                        <ChatBubbleOutlineIcon />
                    </IconButton>
                </Box>

                {/* 좋아요 수 */}
                <Box sx={{ px: 2, pb: 1 }}>
                    <Typography component="span" fontWeight="bold">
                        좋아요 {archive.likeCount}개
                    </Typography>
                </Box>

                {/* 콘텐츠 */}
                <Box sx={{ px: 2, pb: 2 }}>
                    <Typography component="span" fontWeight="bold" mr={1}>
                        {archive.username}
                    </Typography>
                    <Typography component="span" sx={{ wordBreak: 'break-word' }}>
                        {archive.content}
                    </Typography>
                </Box>

                {/* 등록 날짜 */}
                <Box sx={{ px: 2, pb: 2 }}>
                    <Typography component="span" variant="caption" color="text.secondary">
                        {formatRelativeTime(archive.regDate)}
                    </Typography>
                </Box>

                {/* 댓글 섹션 */}
                {commentOpen && (
                    <Box sx={{ borderTop: '1px solid #efefef' }}>
                        {/* 댓글 목록 */}
                        <List>
                            {archive.comments.map(comment => (
                                <CommentItem
                                    key={comment.id}
                                    comment={comment}
                                    currentUserId={currentUserId}
                                    onReplyClick={handleReplyClick}
                                    onDeleteComment={handleDeleteComment}
                                />
                            ))}
                        </List>

                        {/* 새 댓글 입력 - replyTo가 null일 때만 표시 */}
                        {!replyTo && (
                            <Box sx={{ p: 2, display: 'flex', borderTop: '1px solid #efefef' }}>
                                <TextField
                                    fullWidth
                                    placeholder="댓글 작성..."
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    onKeyDown={handleCommentKeyDown}
                                    variant="outlined"
                                    size="small"
                                />
                                <IconButton
                                    color="primary"
                                    onClick={handleAddComment}
                                    disabled={!newComment.trim()}
                                >
                                    <SendIcon />
                                </IconButton>
                            </Box>
                        )}
                    </Box>
                )}

                {/* 답글 입력 다이얼로그 */}
                {replyTo && (
                    <Box sx={{ p: 2, display: 'flex', borderTop: '1px solid #efefef' }}>
                        <TextField
                            fullWidth
                            placeholder="답글 작성..."
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                            onKeyDown={handleReplyKeyDown}
                            variant="outlined"
                            size="small"
                        />
                        <IconButton
                            color="primary"
                            onClick={() => handleReply(replyTo)}
                            disabled={!replyContent.trim()}
                        >
                            <SendIcon />
                        </IconButton>
                    </Box>
                )}

                {/* 하단 버튼 */}
                <Box sx={{ p: 2, borderTop: '1px solid #efefef', display: 'flex', justifyContent: 'space-between' }}>
                    <Button
                        variant="outlined"
                        onClick={handleBack}
                    >
                        이전
                    </Button>
                </Box>
            </Paper>

            {/* 이미지 확대 다이얼로그 */}
            <Dialog
                open={openDialog}
                onClose={handleCloseDialog}
                maxWidth="lg"
                PaperProps={{
                    style: {
                        backgroundColor: 'transparent',
                        boxShadow: 'none',
                        overflow: 'hidden'
                    }
                }}
            >
                <DialogContent sx={{ p: 0, overflow: 'hidden' }}>
                    <Box
                        component="img"
                        src={currentImage}
                        alt="확대된 이미지"
                        sx={{
                            width: '100%',
                            maxHeight: '90vh',
                            objectFit: 'contain'
                        }}
                        onClick={handleCloseDialog}
                    />
                </DialogContent>
            </Dialog>

            {/* 삭제 확인 다이얼로그 */}
            <Dialog
                open={deleteDialogOpen}
                onClose={handleDeleteCancel}
            >
                <DialogTitle>아카이브 삭제</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        이 아카이브를 정말로 삭제하시겠습니까?
                        삭제된 게시물과 사진은 복구할 수 없습니다.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDeleteCancel}>취소</Button>
                    <Button
                        onClick={handleDeleteConfirm}
                        color="error"
                        autoFocus
                    >
                        삭제
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}

// 댓글 및 대댓글 컴포넌트
const CommentItem = ({
                         comment,
                         currentUserId,
                         onReplyClick,
                         onDeleteComment
                     }: {
    comment: CommentData,
    currentUserId: string | null,
    onReplyClick: (id: number) => void,
    onDeleteComment: (id: number) => void
}) => {
    const formatRelativeTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (diffInSeconds < 60) return "방금 전";

        const diffInMinutes = Math.floor(diffInSeconds / 60);
        if (diffInMinutes < 60) return `${diffInMinutes}분 전`;

        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `${diffInHours}시간 전`;

        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays < 7) return `${diffInDays}일 전`;

        return date.toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <ListItem alignItems="flex-start" sx={{ py: 1 }}>
            <ListItemAvatar>
                <Avatar
                    src={comment.profileUrl}
                    alt={comment.username}
                >
                    {!comment.profileUrl && comment.username?.charAt(0)}
                </Avatar>
            </ListItemAvatar>

            <Box sx={{ width: '100%' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                    <Box component="span" sx={{ fontWeight: 'bold', mr: 1 }}>
                        {comment.username}
                    </Box>
                    <Box component="span" sx={{ typography: 'caption', color: 'text.secondary' }}>
                        {formatRelativeTime(comment.regDate)}
                    </Box>
                </Box>

                <Box sx={{ typography: 'body2', mb: 1 }}>
                    {comment.content}
                </Box>

                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <Button
                        size="small"
                        onClick={() => onReplyClick(comment.id)}
                        sx={{ textTransform: 'none', minWidth: 'auto', p: 0 }}
                    >
                        답글 달기
                    </Button>

                    {comment.userId === currentUserId && (
                        <Button
                            size="small"
                            color="error"
                            onClick={() => onDeleteComment(comment.id)}
                            sx={{ textTransform: 'none', minWidth: 'auto', p: 0 }}
                        >
                            삭제
                        </Button>
                    )}
                </Box>

                {/* 대댓글 섹션 */}
                {comment.childComments && comment.childComments.length > 0 && (
                    <Box sx={{ ml: 3, mt: 1 }}>
                        {comment.childComments.map(reply => (
                            <Box key={reply.id} sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
                                <Avatar
                                    sx={{ width: 24, height: 24, mr: 1 }}
                                    src={reply.profileUrl}
                                    alt={reply.username}
                                >
                                    {!reply.profileUrl && reply.username?.charAt(0)}
                                </Avatar>
                                <Box sx={{ width: '100%' }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                                        <Box component="span" sx={{ fontWeight: 'bold', mr: 1, typography: 'body2' }}>
                                            {reply.username}
                                        </Box>
                                        <Box component="span" sx={{ typography: 'caption', color: 'text.secondary' }}>
                                            {formatRelativeTime(reply.regDate)}
                                        </Box>
                                    </Box>

                                    <Box sx={{ typography: 'body2', mb: 1 }}>
                                        {reply.content}
                                    </Box>

                                    {reply.userId === currentUserId && (
                                        <Button
                                            size="small"
                                            color="error"
                                            onClick={() => onDeleteComment(reply.id)}
                                            sx={{ textTransform: 'none', minWidth: 'auto', p: 0 }}
                                        >
                                            삭제
                                        </Button>
                                    )}
                                </Box>
                            </Box>
                        ))}
                    </Box>
                )}
            </Box>
        </ListItem>
    );
};

export default ArchiveDetail;