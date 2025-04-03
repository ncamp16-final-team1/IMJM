import React, { useState, useEffect } from 'react';
// import axios from 'axios'; // 나중에 실제 API 호출 시 필요
import { useNavigate } from 'react-router-dom';

import StarIcon from '@mui/icons-material/Star';
import StarHalfIcon from '@mui/icons-material/StarHalf';
import StarOutlineIcon from '@mui/icons-material/StarOutline';
import salon1Image from "../../assets/images/salon1.jpeg";
import salon2Image from "../../assets/images/salon2.png";
import salon3Image from "../../assets/images/salon3.png";
import salon4Image from "../../assets/images/salon4.png";

import './HairSalon.css';

function HairSalon() {
    const [salons, setSalons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleSalonClick = (salonId) => {
        navigate(`/salon/${salonId}`);
    };

    const renderStars = (score) => {
        const stars = [];
        const fullStars = Math.floor(score);
        const hasHalfStar = score - fullStars >= 0.5;

        // 채워진 별 추가
        for (let i = 0; i < fullStars; i++) {
            stars.push(<StarIcon key={`full-${i}`} sx={{color: '#FFD700'}}/>);
        }

        // 반 별 추가 (0.5 이상인 경우)
        if (hasHalfStar) {
            stars.push(<StarHalfIcon key="half" sx={{color: '#FFD700'}}/>);
        }

        // 빈 별 추가 (5개까지)
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
        for (let i = 0; i < emptyStars; i++) {
            stars.push(<StarOutlineIcon key={`empty-${i}`} sx={{color: '#FFD700'}}/>);
        }

        return stars;
    };

    useEffect(() => {
        const fetchSalons = async () => {
            try {
                // 임시 데이터에 photos 배열 추가
                const mockSalons = [
                    {
                        id: "beauty_salon1",
                        name: "다훈 헤어",
                        address: "서울시 강남구 테헤란로 123",
                        call_number: "02-1234-5678",
                        introduction: "20년 전통의 헤어 디자인 전문 살롱입니다.",
                        holiday_mask: 1,
                        start_time: "10:00",
                        end_time: "20:00",
                        score: 4.5,
                        latitude: 37.5665,
                        longitude: 126.9780,
                        photos: [
                            {photoId: 1, photoUrl: salon1Image, photoOrder: 1}
                        ]
                    },
                    {
                        id: "style_salon2",
                        name: "다훈 살롱",
                        address: "서울시 서초구 강남대로 456",
                        call_number: "02-2345-6789",
                        introduction: "트렌디한 헤어스타일을 제안하는 프리미엄 살롱입니다.",
                        holiday_mask: 2,
                        start_time: "11:00",
                        end_time: "21:00",
                        score: 4.2,
                        latitude: 37.5028,
                        longitude: 127.0243,
                        photos: [
                            {photoId: 1, photoUrl: salon2Image, photoOrder: 1}
                        ]
                    },
                    {
                        id: "style_salon3",
                        name: "다훈 미용실",
                        address: "서울시 서초구 강남대로 456",
                        call_number: "02-2345-6789",
                        introduction: "오늘도 행복한 하루.",
                        holiday_mask: 2,
                        start_time: "11:00",
                        end_time: "21:00",
                        score: 4.2,
                        latitude: 37.5028,
                        longitude: 127.0243,
                        photos: [
                            {photoId: 1, photoUrl: salon3Image, photoOrder: 1}
                        ]
                    },
                    {
                        id: "style_salon4",
                        name: "다훈 해피 피시방",
                        address: "다훈 집앞",
                        call_number: "02-2345-6789",
                        introduction: "어서 오세요.",
                        holiday_mask: 2,
                        start_time: "15:00",
                        end_time: "18:00",
                        score: 2.0,
                        latitude: 37.5028,
                        longitude: 127.0243,
                        photos: [
                            {photoId: 1, photoUrl: salon4Image, photoOrder: 1}
                        ]
                    }
                ];

                // API 호출 대신 임시 데이터 사용
                setTimeout(() => {
                    setSalons(mockSalons);
                    setLoading(false);
                }, 500); // 로딩 상태를 시뮬레이션하기 위한 지연

                // 실제 API 호출 코드 (주석 처리)
                /*
                setLoading(true);
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/salons`);
                setSalons(response.data);
                setLoading(false);
                */
            } catch (err) {
                setError('미용실 데이터를 불러오는데 실패했습니다.');
                console.error('미용실 데이터 불러오기 오류:', err);
                setLoading(false);
            }
        };

        fetchSalons();
    }, []);

    if (loading) {
        return <div className="loading">미용실 검색 중...</div>;
    }

    if (error) {
        return <div className="error">{error}</div>;
    }

    return (
        <div className="hair-salon-container">
            <h2>미용실 목록</h2>

            {salons.length === 0 ? (
                <p>표시할 미용실이 없습니다.</p>
            ) : (
                <div className="salon-list">
                    {salons.map(salon => (
                        <div
                            key={salon.id}
                            className="salon-card"
                            onClick={() => handleSalonClick(salon.id)}
                        >
                            {salon.photos && salon.photos.length > 0 && (
                                <div className="salon-photo">
                                    <img
                                        src={salon.photos[0].photoUrl}
                                        alt={`${salon.name} 대표 이미지`}
                                    />
                                </div>
                            )}
                            <div className="salon-info">
                                <h2>{salon.name}</h2>
                                <div className="salon-business-hours">
                                    {salon.start_time && salon.end_time ? (
                                        <p>영업시간: {salon.start_time} - {salon.end_time}</p>
                                    ) : (
                                        <p>영업시간 정보가 없습니다.</p>
                                    )}
                                </div>
                                {salon.score && (
                                    <div className="salon-rating">
                                        {renderStars(salon.score)}
                                        <span className="score-text">({salon.score})</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default HairSalon;