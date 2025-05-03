import React, { useState, useEffect } from 'react';
import { Container, Typography, Button, Box, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';

interface ArchiveItem {
    id: number;
    content: string;
    regDate: string;
    thumbnailUrl: string;
    userId?: string;
}

interface PageResponse {
    currentPage: number;
    pageSize: number;
    totalElements: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
    contents: ArchiveItem[];
}

const MyArchive: React.FC = () => {
    const navigate = useNavigate();
    const [archives, setArchives] = useState<Map<number, ArchiveItem>>(new Map());
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState<number>(0);
    const [hasMore, setHasMore] = useState<boolean>(true);
    const [userId, setUserId] = useState<string | null>(null);

    // 현재 사용자 ID 가져오기
    useEffect(() => {
        const fetchCurrentUser = async () => {
            try {
                const response = await fetch('/api/archive/current-user', {
                    credentials: 'include'
                });

                if (response.ok) {
                    const data = await response.json();
                    setUserId(data.userId);
                }
            } catch (err) {
                console.error('사용자 정보 가져오기 실패:', err);
            }
        };

        fetchCurrentUser();
    }, []);

    // 아카이브 데이터 가져오기
    useEffect(() => {
        const fetchArchives = async () => {
            if (loading || !hasMore || !userId) return;

            setLoading(true);
            try {
                // 일반 아카이브 API를 사용하되, 클라이언트 측에서 내 게시물만 필터링
                const response = await fetch(`/api/archive/?page=${page}&size=12`);

                if (!response.ok) {
                    throw new Error('아카이브 데이터를 불러오는데 실패했습니다.');
                }

                const data: PageResponse = await response.json();

                // 현재 사용자의 게시물만 필터링
                const myArchives = data.contents.filter(item =>
                    item.thumbnailUrl && item.userId === userId
                );

                if (myArchives.length === 0) {
                    // 더 이상 내 게시물이 없으면서 다음 페이지가 있다면 다음 페이지 불러오기
                    if (data.hasNext) {
                        setPage(prevPage => prevPage + 1);
                    } else {
                        setHasMore(false);
                    }
                } else {
                    // 내 게시물이 있다면 저장
                    setArchives(prevMap => {
                        const newMap = new Map(prevMap);
                        myArchives.forEach(archive => {
                            newMap.set(archive.id, archive);
                        });
                        return newMap;
                    });

                    // 다음 페이지가 있는지 확인
                    setHasMore(data.hasNext);
                    if (data.hasNext) {
                        setPage(prevPage => prevPage + 1);
                    }
                }
            } catch (err) {
                console.error('아카이브 목록 조회 오류:', err);
                setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
            } finally {
                setLoading(false);
            }
        };

        if (userId) {
            fetchArchives();
        }
    }, [page, hasMore, loading, userId]);

    // 무한 스크롤 처리
    useEffect(() => {
        const handleScroll = () => {
            if (
                window.innerHeight + document.documentElement.scrollTop >=
                document.documentElement.scrollHeight - 100 &&
                !loading &&
                hasMore
            ) {
                setPage(prevPage => prevPage + 1);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [loading, hasMore]);

    const handleWriteClick = () => {
        navigate('/archive/write');
    };

    const handleArchiveClick = (id: number) => {
        navigate(`/archive/${id}`);
    };

    const archiveList = Array.from(archives.values());

    return (
        <Container fixed maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h5" fontWeight="bold">
                    내가 쓴 게시물
                </Typography>
                <Button
                    variant="contained"
                    sx={{
                        backgroundColor: '#FDC7BF',
                        boxShadow: 'none',
                        '&:hover': {
                            boxShadow: 'none',
                            backgroundColor: '#FDC7BF'
                        }
                    }}
                    onClick={handleWriteClick}
                >
                    글쓰기
                </Button>
            </Box>

            {error ? (
                <Box bgcolor="#ffebee" p={3} borderRadius={1} mb={4}>
                    <Typography color="error">{error}</Typography>
                </Box>
            ) : archiveList.length > 0 ? (
                <>
                    <Box
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(3, 1fr)',
                            gap: 2
                        }}
                    >
                        {archiveList.map((archive) => (
                            <Box
                                key={`archive-${archive.id}`}
                                onClick={() => handleArchiveClick(archive.id)}
                                sx={{
                                    cursor: 'pointer',
                                    aspectRatio: '1 / 1',
                                    position: 'relative',
                                    borderRadius: '4px',
                                    '&:hover': {
                                        opacity: 0.9,
                                        transform: 'scale(1.02)',
                                        transition: 'all 0.2s ease'
                                    }
                                }}
                            >
                                <img
                                    src={archive.thumbnailUrl}
                                    alt={`아카이브 ${archive.id}`}
                                    loading="lazy"
                                    style={{
                                        position: 'absolute',
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover',
                                        borderRadius: '4px'
                                    }}
                                />
                            </Box>
                        ))}
                    </Box>

                    {loading && (
                        <Box display="flex" justifyContent="center" my={4}>
                            <CircularProgress size={30} />
                        </Box>
                    )}
                </>
            ) : !loading ? (
                <Box textAlign="center" my={8}>
                    <Typography variant="h6" color="text.secondary">
                        아직 등록한 아카이브가 없습니다.
                    </Typography>
                    <Typography variant="body1" color="text.secondary" mt={1}>
                        첫 번째 아카이브를 작성해보세요!
                    </Typography>
                    <Button
                        variant="contained"
                        sx={{
                            backgroundColor: '#FDC7BF',
                            boxShadow: 'none',
                            mt: 3,
                            '&:hover': {
                                boxShadow: 'none',
                                backgroundColor: '#FDC7BF'
                            }
                        }}
                        onClick={handleWriteClick}
                    >
                        글쓰기
                    </Button>
                </Box>
            ) : (
                <Box display="flex" justifyContent="center" my={8}>
                    <CircularProgress />
                </Box>
            )}
        </Container>
    );
};

export default MyArchive;