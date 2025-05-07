import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Home.css';
import { Box, Typography, Button } from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PlaceIcon from '@mui/icons-material/Place';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import promoBanner from '../../assets/images/promo-banner-wide.png';

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
                const response = await axios.get('/api/archive/trending');
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
            {/* 프로모션 배너 */}
            <section className="promo-banner" style={{ backgroundImage: `url(${promoBanner})` }}>
                <Button
                    variant="contained"
                    className="promo-button"
                    endIcon={<ArrowForwardIcon />}
                    onClick={() => navigate('/salon')}
                >
                    Find hair salon
                </Button>
            </section>

            {/* Trending Styles */}
            <section className="section">
                <div className="section-title">
                    <TrendingUpIcon className="section-icon" />
                    <Typography variant="h5">Trending Styles</Typography>
                </div>

                {loading ? (
                    <div className="loading-container">
                        <div className="loading-spinner"></div>
                        <p>로딩 중...</p>
                    </div>
                ) : trendingStyles.length === 0 ? (
                    <div className="empty-state">표시할 스타일이 없습니다.</div>
                ) : (
                    <div className="card-grid">
                        {trendingStyles.map((style) => (
                            <div
                                key={style.id}
                                className="style-card"
                                onClick={() => handleCardClick(style.id)}
                            >
                                <div className="card-image-container">
                                    {style.thumbnailUrl && (
                                        <img
                                            src={style.thumbnailUrl}
                                            alt={`Style ${style.id}`}
                                            className="card-image"
                                        />
                                    )}
                                    <div className="card-badge">Hot</div>
                                </div>
                                <div className="card-hover-effect"></div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* Popular Salons */}
            <section className="section">
                <div className="section-title">
                    <PlaceIcon className="section-icon" />
                    <Typography variant="h5">Best Salons</Typography>
                </div>

                {loading ? (
                    <div className="loading-container">
                        <div className="loading-spinner"></div>
                        <p>로딩 중...</p>
                    </div>
                ) : error ? (
                    <div className="error-state">{error}</div>
                ) : (
                    <div className="card-grid">
                        {popularSalons.map((salon) => (
                            <div
                                key={salon.id}
                                className="salon-card"
                                onClick={() => handleSalonCardClick(salon.id)}
                            >
                                <div className="card-image-container">
                                    <img
                                        src={salon.photoUrl || '/default-salon.jpg'}
                                        alt={salon.name}
                                        className="card-image"
                                    />
                                    {salon.score > 0 && (
                                        <div className="card-rating">
                                            <StarIcon className="rating-icon" />
                                            <span>{salon.score.toFixed(1)}</span>
                                        </div>
                                    )}
                                </div>
                                <div className="card-content">
                                    <h3 className="card-title">{salon.name}</h3>
                                    <p className="card-subtitle">{salon.address}</p>
                                </div>
                                <div className="card-hover-effect"></div>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}

export default Home;
