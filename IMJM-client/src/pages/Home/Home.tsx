// Home.tsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // 추가
import './Home.css';

interface TrendingStyle {
    id: number;
    content: string;
    thumbnailUrl: string;
    regDate: string;
}

function Home(): React.ReactElement {
    const [trendingStyles, setTrendingStyles] = useState<TrendingStyle[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate(); // 추가

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
    }, []);

    // 아카이브 상세 페이지로 이동하는 함수 추가
    const handleCardClick = (id: number) => {
        navigate(`/archive/${id}`);
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

            {/* 나머지 섹션들 */}
        </div>
    );
}

export default Home;