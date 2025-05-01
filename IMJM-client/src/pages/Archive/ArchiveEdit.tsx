import { useState, useEffect, useRef, ChangeEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Container,
    Paper,
    Typography,
    Box,
    CircularProgress,
    Button,
    TextField,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    DialogContentText,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

interface ArchiveDetailData {
    id: number;
    userId: string;
    username: string;
    profileUrl: string;
    content: string;
    regDate: string;
    photoUrls: string[];
}

interface PhotoItem {
    id: number;
    url: string;
    file?: File;
    isNew?: boolean;
}

function ArchiveEdit() {
    const { id } = useParams<{ id?: string }>();
    const navigate = useNavigate();
    const [archive, setArchive] = useState<ArchiveDetailData | null>(null);
    const [content, setContent] = useState<string>('');
    const [photos, setPhotos] = useState<PhotoItem[]>([]);
    const [deletedPhotoIds, setDeletedPhotoIds] = useState<number[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [saving, setSaving] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [confirmDialogOpen, setConfirmDialogOpen] = useState<boolean>(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const fetchArchiveDetail = async () => {
            if (!id) return;

            setLoading(true);
            try {
                const response = await fetch(`/api/archive/${id}`);

                if (!response.ok) {
                    throw new Error('아카이브를 불러오는데 실패했습니다.');
                }

                const data = await response.json();
                setArchive(data);
                setContent(data.content);

                // 기존 사진 목록 설정
                const photoItems: PhotoItem[] = data.photoUrls.map((url: string, index: number) => ({
                    id: index,  // 실제로는 백엔드에서 가져온 사진 ID를 사용해야 함
                    url,
                }));

                setPhotos(photoItems);
            } catch (err) {
                console.error('아카이브 상세 조회 오류:', err);
                setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
            } finally {
                setLoading(false);
            }
        };

        fetchArchiveDetail();
    }, [id]);

    const handleContentChange = (e: ChangeEvent<HTMLInputElement>) => {
        setContent(e.target.value);
    };

    const handleFileSelect = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        const newPhotos: PhotoItem[] = [];

        Array.from(files).forEach(file => {
            const url = URL.createObjectURL(file);
            newPhotos.push({
                id: -1 * Date.now() - Math.floor(Math.random() * 1000),  // 임시 ID (음수로 설정하여 기존 ID와 구분)
                url,
                file,
                isNew: true
            });
        });

        setPhotos([...photos, ...newPhotos]);

        // 파일 선택 초기화 (같은 파일 다시 선택 가능하도록)
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleDeletePhoto = (id: number) => {
        // 기존 사진이면 삭제할 ID 목록에 추가
        const photoToDelete = photos.find(photo => photo.id === id);
        if (photoToDelete && !photoToDelete.isNew) {
            setDeletedPhotoIds([...deletedPhotoIds, id]);
        }

        // 목록에서 제거
        setPhotos(photos.filter(photo => photo.id !== id));

        // 새로 추가한 파일인 경우 메모리에서 URL 해제
        if (photoToDelete && photoToDelete.isNew) {
            URL.revokeObjectURL(photoToDelete.url);
        }
    };

    const handleMovePhoto = (id: number, direction: 'up' | 'down') => {
        const currentIndex = photos.findIndex(photo => photo.id === id);
        if (currentIndex === -1) return;

        const newPhotos = [...photos];

        if (direction === 'up' && currentIndex > 0) {
            // 위로 이동
            [newPhotos[currentIndex - 1], newPhotos[currentIndex]] =
                [newPhotos[currentIndex], newPhotos[currentIndex - 1]];
        } else if (direction === 'down' && currentIndex < photos.length - 1) {
            // 아래로 이동
            [newPhotos[currentIndex], newPhotos[currentIndex + 1]] =
                [newPhotos[currentIndex + 1], newPhotos[currentIndex]];
        }

        setPhotos(newPhotos);
    };

    const handleSave = async () => {
        if (!id || !archive) return;

        setSaving(true);
        try {
            // 1. 기본 정보 및 기존 사진 순서 업데이트
            const photoOrders: Record<number, number> = {};

            photos.forEach((photo, index) => {
                if (!photo.isNew) {
                    photoOrders[photo.id] = index;
                }
            });

            const updateData = {
                content,
                deletePhotoIds: deletedPhotoIds,
                photoOrders
            };

            const response = await fetch(`/api/archive/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updateData)
            });

            if (!response.ok) {
                throw new Error('아카이브 수정에 실패했습니다.');
            }

            // 2. 새로운 사진 업로드 (있는 경우)
            const newPhotos = photos.filter(photo => photo.isNew && photo.file);

            if (newPhotos.length > 0) {
                const formData = new FormData();
                newPhotos.forEach(photo => {
                    if (photo.file) {
                        formData.append('photos', photo.file);
                    }
                });

                const uploadResponse = await fetch(`/api/archive/${id}/photos`, {
                    method: 'POST',
                    body: formData
                });

                if (!uploadResponse.ok) {
                    throw new Error('새 사진 업로드에 실패했습니다.');
                }
            }

            // 성공 시 상세 페이지로 이동
            navigate(`/archive/${id}`);
        } catch (err) {
            console.error('아카이브 수정 오류:', err);
            setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        // 수정 내용이 있을 경우 확인 대화상자 표시
        if (content !== archive?.content || deletedPhotoIds.length > 0 || photos.some(p => p.isNew)) {
            setConfirmDialogOpen(true);
        } else {
            navigate(`/archive/${id}`);
        }
    };

    const handleConfirmDialogClose = () => {
        setConfirmDialogOpen(false);
    };

    const handleConfirmCancel = () => {
        // URL 객체 해제
        photos.forEach(photo => {
            if (photo.isNew) {
                URL.revokeObjectURL(photo.url);
            }
        });

        setConfirmDialogOpen(false);
        navigate(`/archive/${id}`);
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
                    <Button onClick={() => navigate(`/archive/${id}`)} variant="outlined" startIcon={<ArrowBackIcon />}>
                        돌아가기
                    </Button>
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
                        <Button onClick={() => navigate('/archive')} variant="outlined">
                            목록으로
                        </Button>
                    </Box>
                </Paper>
            </Container>
        );
    }

    return (
        <Container fixed maxWidth="md" sx={{ mt: 4, mb: 4 }}>
            <Paper elevation={0} sx={{ borderRadius: 2, overflow: 'hidden', border: '1px solid #dbdbdb', backgroundColor: '#FDF6F3' }}>
                {/* 헤더 */}
                <Box sx={{ p: 2, display: 'flex', alignItems: 'center', borderBottom: '1px solid #efefef' }}>
                    <IconButton edge="start" color="inherit" onClick={handleCancel} sx={{ mr: 2 }}>
                        <ArrowBackIcon />
                    </IconButton>
                    <Typography variant="h6" sx={{ flexGrow: 1 }}>
                        아카이브 수정
                    </Typography>
                    <Button
                        variant="contained"
                        sx={{
                            bgcolor: '#FDC7BF',
                            color: 'black',
                            '&:hover': {
                                bgcolor: '#fbb1a5'
                            },
                            boxShadow: 'none'
                        }}
                        onClick={handleSave}
                        disabled={saving || !content.trim()}
                    >
                        {saving ? <CircularProgress size={24} color="inherit" /> : '저장'}
                    </Button>
                </Box>

                {/* 콘텐츠 입력 */}
                <Box sx={{ p: 2, borderBottom: '1px solid #efefef' }}>
                    <TextField
                        fullWidth
                        multiline
                        rows={4}
                        variant="outlined"
                        placeholder="내용을 입력하세요..."
                        value={content}
                        onChange={handleContentChange}
                    />
                </Box>

                {/* 사진 관리 */}
                <Box sx={{ p: 2 }}>
                    <Typography variant="subtitle1" gutterBottom>
                        사진 관리
                    </Typography>
                    <Typography variant="caption" color="text.secondary" paragraph>
                        사진을 위아래로 이동하여 순서를 변경하거나, 삭제 버튼을 눌러 제거할 수 있습니다.
                    </Typography>

                    {/* 사진 목록 */}
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', margin: '-8px' }}>
                        {photos.map((photo, index) => (
                            <Box
                                key={photo.id}
                                sx={{
                                    width: { xs: '100%', sm: 'calc(50% - 16px)', md: 'calc(33.333% - 16px)' },
                                    padding: '8px'
                                }}
                            >
                                <Box
                                    sx={{
                                        position: 'relative',
                                        width: '100%',
                                        paddingTop: '100%',
                                        border: '1px solid #efefef',
                                        borderRadius: 1,
                                        overflow: 'hidden',
                                        mb: 2
                                    }}
                                >
                                    <Box
                                        component="img"
                                        src={photo.url}
                                        alt={`사진 ${index + 1}`}
                                        sx={{
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover'
                                        }}
                                    />
                                    <Box sx={{
                                        position: 'absolute',
                                        top: 0,
                                        right: 0,
                                        p: 1,
                                        bgcolor: 'rgba(0, 0, 0, 0.3)'
                                    }}>
                                        <IconButton
                                            size="small"
                                            sx={{ color: 'white' }}
                                            onClick={() => handleDeletePhoto(photo.id)}
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </Box>
                                    {photo.isNew && (
                                        <Box sx={{
                                            position: 'absolute',
                                            bottom: 0,
                                            right: 0,
                                            bgcolor: 'primary.main',
                                            color: 'white',
                                            px: 1,
                                            py: 0.5,
                                            fontSize: '0.75rem',
                                            borderTopLeftRadius: 4
                                        }}>
                                            새 사진
                                        </Box>
                                    )}
                                    <Box sx={{
                                        position: 'absolute',
                                        bottom: 0,
                                        left: 0,
                                        p: 1,
                                        display: 'flex',
                                        flexDirection: 'column'
                                    }}>
                                        <IconButton
                                            size="small"
                                            sx={{ color: 'white', bgcolor: 'rgba(0, 0, 0, 0.3)', mb: 1 }}
                                            onClick={() => handleMovePhoto(photo.id, 'up')}
                                            disabled={index === 0}
                                        >
                                            <KeyboardArrowUpIcon fontSize="small" />
                                        </IconButton>
                                        <IconButton
                                            size="small"
                                            sx={{ color: 'white', bgcolor: 'rgba(0, 0, 0, 0.3)' }}
                                            onClick={() => handleMovePhoto(photo.id, 'down')}
                                            disabled={index === photos.length - 1}
                                        >
                                            <KeyboardArrowDownIcon fontSize="small" />
                                        </IconButton>
                                    </Box>
                                </Box>
                            </Box>
                        ))}
                        <Box
                            sx={{
                                width: { xs: '100%', sm: 'calc(50% - 16px)', md: 'calc(33.333% - 16px)' },
                                padding: '8px'
                            }}
                        >
                            <Box
                                sx={{
                                    width: '100%',
                                    paddingTop: '100%',
                                    border: '2px dashed #ccc',
                                    borderRadius: 1,
                                    position: 'relative',
                                    cursor: 'pointer',
                                    '&:hover': {
                                        borderColor: 'primary.main',
                                        bgcolor: 'rgba(0, 0, 0, 0.04)'
                                    }
                                }}
                                onClick={handleFileSelect}
                            >
                                <Box
                                    sx={{
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        width: '100%',
                                        height: '100%',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'center',
                                        alignItems: 'center'
                                    }}
                                >
                                    <CameraAltIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                                    <Typography variant="body2" color="text.secondary">
                                        사진 추가
                                    </Typography>
                                </Box>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    style={{ display: 'none' }}
                                    accept="image/*"
                                    multiple
                                    onChange={handleFileChange}
                                />
                            </Box>
                        </Box>
                    </Box>
                </Box>
            </Paper>

            {/* 취소 확인 대화상자 */}
            <Dialog
                open={confirmDialogOpen}
                onClose={handleConfirmDialogClose}
            >
                <DialogTitle>변경 사항 저장 안 함</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        변경 사항이 저장되지 않습니다. 계속하시겠습니까?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleConfirmDialogClose}>계속 편집</Button>
                    <Button onClick={handleConfirmCancel} color="primary" autoFocus>
                        저장 안 함
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}

export default ArchiveEdit;