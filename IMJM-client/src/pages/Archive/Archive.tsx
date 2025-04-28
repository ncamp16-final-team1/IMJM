import { useState, useEffect } from 'react';
import { Container, Typography, Button, Box, CircularProgress} from '@mui/material';
import { useNavigate } from 'react-router-dom';

interface ArchiveItem {
    id: number;
    content: string;
    regDate: string;
    thumbnailUrl: string;
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

const Archive: React.FC = () => {
    const navigate = useNavigate();
    const [archives, setArchives] = useState<Map<number, ArchiveItem>>(new Map());
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState<number>(0);
    const [hasMore, setHasMore] = useState<boolean>(true);

    useEffect(() => {
        const fetchArchives = async () => {
            if (loading || !hasMore) return;

            setLoading(true);
            try {
                const response = await fetch(`/api/archive/?page=${page}&size=12`);

                if (!response.ok) {
                    throw new Error('아카이브 데이터를 불러오는데 실패했습니다.');
                }

                const data: PageResponse = await response.json();
                console.log("API 응답 데이터:", data);

                setHasMore(data.hasNext);

                if (data.contents.length === 0) {
                    setHasMore(false);
                } else {
                    const newArchives = data.contents.filter(item => item.thumbnailUrl);
                    console.log("필터링 후 새 아카이브:", newArchives);

                    setArchives(prevMap => {
                        const newMap = new Map(prevMap);
                        newArchives.forEach(archive => {
                            newMap.set(archive.id, archive);
                        });
                        return newMap;
                    });

                    setPage(prevPage => prevPage + 1);
                }
            } catch (err) {
                console.error('아카이브 목록 조회 오류:', err);
                setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
            } finally {
                setLoading(false);
            }
        };

        fetchArchives();
    }, [page, hasMore, loading]);

    useEffect(() => {
        const handleScroll = () => {
            if (
                window.innerHeight + document.documentElement.scrollTop >=
                document.documentElement.scrollHeight - 100 &&
                !loading &&
                hasMore
            ) {
                setPage(prevPage => prevPage);
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
    console.log("렌더링할 아카이브 목록:", archiveList);

    return (
        <Container fixed maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <Box display="flex" justifyContent="flex-end" alignItems="center" mb={3}>
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

                    {/* 로딩 인디케이터 */}
                    {loading && (
                        <Box display="flex" justifyContent="center" my={4}>
                            <CircularProgress size={30} />
                        </Box>
                    )}
                </>
            ) : !loading ? (
                <Box textAlign="center" my={8}>
                    <Typography variant="h6" color="text.secondary">
                        아직 등록된 아카이브가 없습니다.
                    </Typography>
                    <Typography variant="body1" color="text.secondary" mt={1}>
                        첫 번째 아카이브를 작성해보세요!
                    </Typography>
                </Box>
            ) : (
                <Box display="flex" justifyContent="center" my={8}>
                    <CircularProgress />
                </Box>
            )}
        </Container>
    );
};

export default Archive;