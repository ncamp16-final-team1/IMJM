import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Home.css';
import { Card, CardContent, CardMedia, Typography, Box, Rating } from '@mui/material';

interface TrendingStyle {
    id: number;
    content: string;
    thumbnailUrl: string;
    regDate: string;
}

interface PopularSalonDto {
    id: string;
    name: string;
    address: string;
    score: number;
    reservationCount: number;
    photoUrl: string;
}

function Home(): React.ReactElement {
    const [trendingStyles, setTrendingStyles] = useState<TrendingStyle[]>([]);
    const [popularSalons, setPopularSalons] = useState<PopularSalonDto[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchTrendingStyles = async () => {
            try {
                // 좋아요 순으로 정렬된 아카이브 가져오기
                const response = await axios.get('/api/archive/trending');
                // 응답 데이터의 contents 필드 사용
                setTrendingStyles(response.data.contents || []);
            } catch (error) {
                console.error('Failed to fetch trending styles:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchTrendingStyles();

        const fetchPopularSalons = async () => {
            try {
                const response = await axios.get('/api/salon/popular');
                setPopularSalons(response.data);
                setLoading(false);
            } catch (err) {
                setError('인기 미용실 정보를 불러오는데 실패했습니다.');
                setLoading(false);
                console.error('Error fetching popular salons:', err);
            }
        };

        fetchPopularSalons();
    }, []);

    const handleCardClick = (id: number) => {
        navigate(`/archive/${id}`);
    };

    const handleSalonCardClick = (salonId: string) => {
        navigate(`/salon/${salonId}`);
    };

    return (
        <div className="home-page">

            {/* Trending Styles */}
            <section className="trending-styles">
                <h2>Trending Styles</h2>
                {loading ? (
                    <div className="loading">로딩 중...</div>
                ) : trendingStyles.length === 0 ? (
                    <div className="no-data">표시할 스타일이 없습니다.</div>
                ) : (
                    <div className="styles-grid">
                        {trendingStyles.map((style) => (
                            <div
                                key={style.id}
                                className="style-card"
                                onClick={() => handleCardClick(style.id)}
                                style={{ cursor: 'pointer' }} // 마우스 커서 스타일 추가
                            >
                                {style.thumbnailUrl && (
                                    <img
                                        src={style.thumbnailUrl}
                                        alt={`Style ${style.id}`}
                                        className="style-image"
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </section>

            <section className="popular-salons">
                <h2>Popular Hair Salons</h2>

                {loading && <div className="loading">로딩 중...</div>}
                {error && <div className="error">{error}</div>}

                {!loading && !error && (
                    <div className="popular-salons-grid">
                        {popularSalons.map((salon) => (
                            <div
                                key={salon.id}
                                className="popular-salon-card"
                                onClick={() => handleSalonCardClick(salon.id)}
                                style={{ cursor: 'pointer' }}
                            >
                                <img
                                    src={salon.photoUrl || '/default-salon.jpg'}
                                    alt={salon.name}
                                    className="salon-image"
                                />
                                <div className="salon-name">
                                    {salon.name}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}

export default Home;