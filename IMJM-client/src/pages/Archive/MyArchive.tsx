import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Container,
    Typography,
    Box,
    CircularProgress,
    Paper,
    List,
    ListItem,
    ListItemText,
    Avatar,
    Button,
    Divider
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';

interface ArchiveItem {
    id: number;
    userId: string;
    username: string;
    profileUrl: string;
    content: string;
    regDate: string;
    photoUrl: string;
    likeCount: number;
    commentCount: number;
}

function MyArchive() {
    const navigate = useNavigate();
    const [archives, setArchives] = useState<ArchiveItem[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // 내가 쓴 글 불러오기
        const fetchMyArchives = async () => {
            setLoading(true);
            try {
                const response = await fetch('/api/archive/my', {
                    credentials: 'include' // 인증 정보 포함
                });

                if (!response.ok) {
                    throw new Error('내 아카이브를 불러오는데 실패했습니다.');
                }

                const data = await response.json();
                setArchives(data.content || data);
            } catch (err) {
                console.error('내 아카이브 로딩 오류:', err);
                setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
            } finally {
                setLoading(false);
            }
        };

        fetchMyArchives();
    }, []);

    const handleArchiveClick = (id: number) => {
        navigate(`/archive/${id}`);
    };

    const handleCreateClick = () => {
        navigate('/archive/create');
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

    return (
        <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
            <Box sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 3
            }}>
                <Typography variant="h5" fontWeight="bold">
                    내가 쓴 글
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleCreateClick}
                    sx={{
                        backgroundColor: '#FDC7BF',
                        color: 'black',
                        boxShadow: 'none',
                        '&:hover': {
                            backgroundColor: '#fbb1a5'
                        }
                    }}
                >
                    새 글 작성
                </Button>
            </Box>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                    <CircularProgress />
                </Box>
            ) : error ? (
                <Paper elevation={0} sx={{ p: 3, backgroundColor: '#FDF6F3', border: '1px solid #dbdbdb' }}>
                    <Typography color="error">{error}</Typography>
                </Paper>
            ) : archives.length > 0 ? (
                <Paper elevation={0} sx={{ borderRadius: 2, backgroundColor: '#FDF6F3', border: '1px solid #dbdbdb' }}>
                    <List>
                        {archives.map((archive, index) => (
                            <Box key={archive.id}>
                                <ListItem
                                    alignItems="flex-start"
                                    sx={{
                                        py: 2,
                                        cursor: 'pointer',
                                        '&:hover': {
                                            backgroundColor: 'rgba(0, 0, 0, 0.04)'
                                        }
                                    }}
                                    onClick={() => handleArchiveClick(archive.id)}
                                >
                                    <Box sx={{ display: 'flex', width: '100%' }}>
                                        {/* 썸네일 이미지 */}
                                        <Box
                                            sx={{
                                                width: 100,
                                                height: 100,
                                                mr: 2,
                                                borderRadius: 1,
                                                overflow: 'hidden',
                                                flexShrink: 0
                                            }}
                                        >
                                            <img
                                                src={archive.photoUrl}
                                                alt={`아카이브 ${archive.id}`}
                                                style={{
                                                    width: '100%',
                                                    height: '100%',
                                                    objectFit: 'cover'
                                                }}
                                            />
                                        </Box>

                                        {/* 콘텐츠 */}
                                        <Box sx={{ flexGrow: 1 }}>
                                            {/* 사용자 정보 */}
                                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                                <Avatar
                                                    src={archive.profileUrl}
                                                    alt={archive.username}
                                                    sx={{ width: 32, height: 32, mr: 1 }}
                                                >
                                                    {!archive.profileUrl && archive.username.charAt(0)}
                                                </Avatar>
                                                <Typography variant="subtitle2" fontWeight="bold">
                                                    {archive.username}
                                                </Typography>
                                            </Box>

                                            {/* 게시글 내용 */}
                                            <ListItemText
                                                primary={
                                                    <Typography
                                                        variant="body2"
                                                        sx={{
                                                            overflow: 'hidden',
                                                            textOverflow: 'ellipsis',
                                                            display: '-webkit-box',
                                                            WebkitLineClamp: 2,
                                                            WebkitBoxOrient: 'vertical'
                                                        }}
                                                    >
                                                        {archive.content}
                                                    </Typography>
                                                }
                                                secondary={
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                                                        <Typography variant="caption" color="text.secondary">
                                                            {formatRelativeTime(archive.regDate)}
                                                        </Typography>
                                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                            <FavoriteIcon sx={{ fontSize: 16, color: '#ff6b6b', mr: 0.5 }} />
                                                            <Typography variant="caption" sx={{ mr: 1 }}>
                                                                {archive.likeCount}
                                                            </Typography>

                                                            <ChatBubbleOutlineIcon sx={{ fontSize: 16, mr: 0.5 }} />
                                                            <Typography variant="caption">
                                                                {archive.commentCount}
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                }
                                            />
                                        </Box>
                                    </Box>
                                </ListItem>
                                {index < archives.length - 1 && <Divider />}
                            </Box>
                        ))}
                    </List>
                </Paper>
            ) : (
                <Paper elevation={0} sx={{ p: 5, backgroundColor: '#FDF6F3', borderRadius: 2, border: '1px solid #dbdbdb', textAlign: 'center' }}>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                        작성한 글이 없습니다.
                    </Typography>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={handleCreateClick}
                        sx={{
                            backgroundColor: '#FDC7BF',
                            color: 'black',
                            boxShadow: 'none',
                            '&:hover': {
                                backgroundColor: '#fbb1a5'
                            }
                        }}
                    >
                        첫 글 작성하기
                    </Button>
                </Paper>
            )}
        </Container>
    );
}

export default MyArchive;