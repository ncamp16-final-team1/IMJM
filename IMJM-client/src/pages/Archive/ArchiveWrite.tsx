import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Container,
    Paper,
    Typography,
    TextField,
    Button
} from '@mui/material';

const ArchiveWrite: React.FC = () => {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        content: ''
    });

    const [photos, setPhotos] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const {name, value} = e.target;
        setForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const filesArray = Array.from(e.target.files);

            setPhotos(prev => [...prev, ...filesArray]);

            const newPreviewUrls = filesArray.map(file => URL.createObjectURL(file));
            setPreviews(prev => [...prev, ...newPreviewUrls]);

            e.target.value = '';
        }
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        setError(null);

        try {
            if (!form.content) {
                throw new Error('내용을 입력해주세요.');
            }

            if (photos.length === 0) {
                throw new Error('사진을 최소 1장 이상 첨부해주세요.');
            }


            const formData = new FormData();

            formData.append('content', form.content);

            photos.forEach(photo => {
                formData.append('photos', photo);
            });

            console.log('폼 데이터:', form);
            console.log('사진 개수:', photos.length);

            const token = localStorage.getItem('token'); // 토큰은 여전히 필요합니다

            const response = await fetch('/api/archive/', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData,
            });

            console.log('응답 상태:', response.status);

            if (response.ok) {
                const archiveId = await response.json();
                console.log('아카이브가 성공적으로 생성되었습니다:', archiveId);
                navigate('/archive');
            } else {
                const errorText = await response.text();
                console.error('서버 오류 응답:', errorText);
                throw new Error(`아카이브 생성에 실패했습니다. (${response.status})`);
            }
        } catch (err) {
            console.error('아카이브 생성 실패:', err);
            setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Container fixed sx={{mt: 4, mb: 4}} maxWidth="lg">
            <Paper elevation={3} sx={{p: 4, backgroundColor: '#FDF6F3'}}>
                <Typography variant="h4" component="h1" gutterBottom align="center">
                    글 작성
                </Typography>

                {error && (
                    <div style={{
                        marginBottom: '16px',
                        padding: '16px',
                        backgroundColor: '#ffebee',
                        borderRadius: '4px',
                        color: '#d32f2f'
                    }}>
                        {error}
                    </div>
                )}

                <div style={{display: 'flex', flexDirection: 'column', gap: '24px'}}>
                    {/* 사진 첨부 영역 먼저 배치 */}
                    <div>
                        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                            사진 첨부
                        </Typography>

                        <div>
                            <input
                                accept="image/*"
                                id="upload-photos"
                                type="file"
                                multiple
                                style={{display: 'none'}}
                                onChange={handleImageChange}
                            />
                            <label htmlFor="upload-photos" style={{cursor: 'pointer', display: 'inline-block'}}>
                                <div style={{
                                    width: '95px',
                                    height: '70px',
                                    backgroundColor: '#ddd',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    borderRadius: '4px',
                                }}>
                                    <Typography fontSize="2rem">＋</Typography>
                                </div>
                            </label>

                            <div style={{
                                marginTop: '8px',
                                display: 'flex',
                                gap: '8px',
                                flexWrap: 'wrap'
                            }}>
                                {previews.map((src, index) => (
                                    <div key={index} style={{position: 'relative'}}>
                                        <img
                                            src={src}
                                            alt={`미리보기 ${index + 1}`}
                                            style={{
                                                width: '95px',
                                                height: '70px',
                                                objectFit: 'cover',
                                                borderRadius: '4px'
                                            }}
                                        />
                                        <div
                                            style={{
                                                position: 'absolute',
                                                top: '-8px',
                                                right: '-8px',
                                                width: '24px',
                                                height: '24px',
                                                backgroundColor: 'rgba(0,0,0,0.5)',
                                                borderRadius: '50%',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                cursor: 'pointer',
                                                color: 'white',
                                                fontSize: '12px'
                                            }}
                                            onClick={() => {
                                                setPreviews(prev => prev.filter((_, i) => i !== index));
                                                setPhotos(prev => prev.filter((_, i) => i !== index));
                                            }}
                                        >
                                            ✕
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* 내용 입력 영역을 그 다음에 배치 */}
                    <div>
                        <TextField
                            fullWidth
                            label="내용"
                            name="content"
                            value={form.content}
                            onChange={handleInputChange}
                            multiline
                            rows={5}
                            required
                            placeholder="아카이브 내용을 입력하세요..."
                        />
                    </div>
                </div>

                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginTop: '32px'
                }}>
                    <Button
                        variant="outlined"
                        onClick={() => navigate('/archive')}
                    >
                        취소
                    </Button>
                    <Button
                        variant="contained"
                        disabled={isSubmitting}
                        sx={{
                            backgroundColor: '#FDC7BF',
                            boxShadow: 'none',
                            '&:hover': {
                                boxShadow: 'none',
                                backgroundColor: '#FDC7BF'
                            }
                        }}
                        onClick={handleSubmit}
                    >
                        {isSubmitting ? '저장 중...' : '완료'}
                    </Button>
                </div>
            </Paper>
        </Container>
    );
}

export default ArchiveWrite;