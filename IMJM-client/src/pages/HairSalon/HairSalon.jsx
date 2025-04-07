import React, { useState, useEffect, useRef } from 'react';
// import axios from 'axios';
import { useNavigate } from 'react-router-dom';

import StarIcon from '@mui/icons-material/Star';
import StarHalfIcon from '@mui/icons-material/StarHalf';
import StarOutlineIcon from '@mui/icons-material/StarOutline';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import salon1Image from "../../assets/images/salon1.jpeg";
import salon2Image from "../../assets/images/salon2.png";
import salon3Image from "../../assets/images/salon3.png";
import salon4Image from "../../assets/images/salon4.png";
import salonData from "../../data/salon.json";
import userData from "../../data/user.json"; // 사용자 데이터 불러오기

import './HairSalon.css';

function HairSalon() {
    const [salons, setSalons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [nearbySalons, setNearbySalons] = useState([]);
    const [mapLoaded, setMapLoaded] = useState(false);
    const mapRef = useRef(null);
    const navigate = useNavigate();

    const handleSalonClick = (salonId) => {
        navigate(`/salon/${salonId}`);
    };

    const renderStars = (score) => {
        const stars = [];
        const fullStars = Math.floor(score);
        const hasHalfStar = score - fullStars >= 0.5;

        for (let i = 0; i < fullStars; i++) {
            stars.push(<StarIcon key={`full-${i}`} sx={{color: '#FFD700'}}/>);
        }

        if (hasHalfStar) {
            stars.push(<StarHalfIcon key="half" sx={{color: '#FFD700'}}/>);
        }

        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
        for (let i = 0; i < emptyStars; i++) {
            stars.push(<StarOutlineIcon key={`empty-${i}`} sx={{color: '#FFD700'}}/>);
        }

        return stars;
    };

    // 두 좌표 간의 거리 계산 (하버사인 공식)
    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371; // 지구 반경 (km)
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a =
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        const distance = R * c; // 킬로미터 단위
        return distance;
    };

    // 가까운 미용실 찾기
    const findNearbySalons = (userLocation, salons) => {
        const maxDistance = 10; // 10km 이내의 미용실만 표시

        return salons.filter(salon => {
            const distance = calculateDistance(
                userLocation.latitude,
                userLocation.longitude,
                salon.latitude,
                salon.longitude
            );
            salon.distance = distance; // 거리 정보 추가
            return distance <= maxDistance;
        }).sort((a, b) => a.distance - b.distance); // 거리 기준 정렬
    };

    // 네이버 지도 초기화
    const initMap = (userLocation, salonsWithPhotos) => {
        if (!window.naver) return;

        const mapOptions = {
            center: new window.naver.maps.LatLng(userLocation.latitude, userLocation.longitude),
            zoom: 12,
            zoomControl: true,
            zoomControlOptions: {
                position: window.naver.maps.Position.TOP_RIGHT
            }
        };

        const map = new window.naver.maps.Map(mapRef.current, mapOptions);

        // 사용자 위치 마커
        new window.naver.maps.Marker({
            position: new window.naver.maps.LatLng(userLocation.latitude, userLocation.longitude),
            map: map,
            icon: {
                content: '<div class="user-marker"><LocationOnIcon style="color: blue; font-size: 32px;" /></div>',
                anchor: new window.naver.maps.Point(16, 32)
            },
            title: '내 위치'
        });

        // 주변 미용실 표시
        const nearby = findNearbySalons(userLocation, salonsWithPhotos);
        setNearbySalons(nearby);

        // 미용실 마커 표시
        nearby.forEach(salon => {
            const marker = new window.naver.maps.Marker({
                position: new window.naver.maps.LatLng(salon.latitude, salon.longitude),
                map: map,
                title: salon.name
            });

            // 정보창 생성
            const infoContent = `
                <div style="padding: 10px; width: 200px;">
                    <h3 style="margin-top: 0;">${salon.name}</h3>
                    <p>${salon.address || '주소 정보 없음'}</p>
                    <p>평점: ${salon.score || 'N/A'}</p>
                    <p>거리: ${salon.distance.toFixed(1)}km</p>
                </div>
            `;

            const infoWindow = new window.naver.maps.InfoWindow({
                content: infoContent,
                maxWidth: 250,
                backgroundColor: "#fff",
                borderColor: "#888",
                borderWidth: 1,
                anchorSize: new window.naver.maps.Size(10, 10),
                pixelOffset: new window.naver.maps.Point(10, -10)
            });

            // 마커 클릭시 정보창 표시 및 다른 정보창 닫기
            window.naver.maps.Event.addListener(marker, 'click', () => {
                if (infoWindow.getMap()) {
                    infoWindow.close();
                } else {
                    infoWindow.open(map, marker);
                }
            });
        });
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                // 현재 사용자 설정 (첫 번째 사용자로 가정)
                const user = userData[0]; // 또는 로그인된 사용자 ID 기반으로 선택
                setCurrentUser(user);

                // 이미지 매핑
                const imageMap = {
                    'salon1.jpeg': salon1Image,
                    'salon2.png': salon2Image,
                    'salon3.png': salon3Image,
                    'salon4.png': salon4Image
                };

                // JSON 데이터에 photos 배열 추가
                const salonsWithPhotos = salonData.map(salon => ({
                    ...salon,
                    photos: [
                        {
                            photoId: 1,
                            photoUrl: imageMap[salon.photoUrl] || salon1Image,
                            photoOrder: 1
                        }
                    ]
                }));

                // 데이터 설정
                setSalons(salonsWithPhotos);

                // 네이버 지도 API 로드
                const script = document.createElement('script');
                script.src = `https://openapi.map.naver.com/openapi/v3/maps.js?ncpClientId=cv8i9hdmhu`;
                script.async = true;
                script.onload = () => setMapLoaded(true);
                document.head.appendChild(script);

                setLoading(false);

                return () => {
                    if (script.parentNode) {
                        document.head.removeChild(script);
                    }
                };
            } catch (err) {
                setError('데이터를 불러오는데 실패했습니다.');
                console.error('데이터 불러오기 오류:', err);
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // 지도 초기화 (API 로드 후)
    useEffect(() => {
        if (mapLoaded && salons.length > 0 && currentUser) {
            initMap(currentUser, salons);
        }
    }, [mapLoaded, salons, currentUser]);

    if (loading) {
        return <div className="loading">미용실 검색 중...</div>;
    }

    if (error) {
        return <div className="error">{error}</div>;
    }

    return (
        <div className="hair-salon-container">
            {/* 네이버 지도 영역 */}
            <div className="map-container">
                <h2>내 주변 미용실</h2>
                <div ref={mapRef} className="map"></div>

                {nearbySalons.length > 0 ? (
                    <div className="nearby-salons">
                        <h3>가까운 미용실 ({nearbySalons.length})</h3>
                        <div className="nearby-salon-list">
                            {nearbySalons.map(salon => (
                                <div
                                    key={salon.id}
                                    className="nearby-salon-item"
                                    onClick={() => handleSalonClick(salon.id)}
                                >
                                    <div className="nearby-salon-info">
                                        <h4>{salon.name}</h4>
                                        <p>{salon.distance.toFixed(1)}km</p>
                                    </div>
                                    {salon.score && (
                                        <div className="nearby-salon-rating">
                                            {renderStars(salon.score)}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <p className="no-nearby">주변에 미용실이 없습니다.</p>
                )}
            </div>

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