// src/components/archive/ArchiveForm.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Container,
    Paper,
    Typography,
    TextField,
    Button
} from '@mui/material';

const Archive: React.FC = () => {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        content: ''
    });

    const [photos, setPhotos] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // 입력 필드 변경 처리
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // 파일 선택 처리
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const filesArray = Array.from(e.target.files);
            setPhotos(filesArray);

            // 이미지 미리보기 생성
            const previewUrls = filesArray.map(file => URL.createObjectURL(file));
            setPreviews(previewUrls);
        }
    };

    // 폼 제출 처리
    const handleSubmit = async () => {
        setIsSubmitting(true);
        setError(null);

        try {
            // 필수 필드 검증
            if (!form.content) {
                throw new Error('내용을 입력해주세요.');
            }

            const formData = new FormData();

            // 폼 데이터를 JSON 문자열로 변환하여 추가
            formData.append('archiveDto', new Blob([JSON.stringify(form)], {
                type: 'application/json'
            }));

            // 사진 파일 추가
            photos.forEach(photo => {
                formData.append('photos', photo);
            });

            // 디버깅용 로그
            console.log('폼 데이터:', form);
            console.log('사진 개수:', photos.length);

            const response = await fetch('/api/archive/', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
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
        <Container fixed sx={{ mt: 4, mb: 4 }} maxWidth="lg">
            <Paper elevation={3} sx={{ p: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom align="center">
                    새 아카이브 작성
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

                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
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
                                style={{ display: 'none' }}
                                onChange={handleImageChange}
                            />
                            <label htmlFor="upload-photos" style={{ cursor: 'pointer', display: 'inline-block' }}>
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
                                    <div key={index} style={{ position: 'relative' }}>
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
                        color="primary"
                        onClick={handleSubmit}
                    >
                        {isSubmitting ? '저장 중...' : '저장하기'}
                    </Button>
                </div>
            </Paper>
        </Container>
    );
};

export default Archive;