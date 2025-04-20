import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

import StarIcon from '@mui/icons-material/Star';
import StarHalfIcon from '@mui/icons-material/StarHalf';
import StarOutlineIcon from '@mui/icons-material/StarOutline';
import salon1Image from "../../assets/images/salon1.jpeg";

import './HairSalon.css';

// 네이버 맵 타입 정의
declare global {
    interface Window {
        naver: any;
    }
}

// 인터페이스 정의
interface SalonPhoto {
    photoId: number;
    photoUrl: string;
    photoOrder: number;
}

interface Salon {
    id: string;
    name: string;
    address: string;
    call_number: string;
    introduction: string;
    holiday_mask: number;
    start_time: string;
    end_time: string;
    score: number;
    latitude: number;
    longitude: number;
    photoUrl: string;
    photos?: SalonPhoto[];
    distance?: number;
}

interface UserLocation {
    latitude: number;
    longitude: number;
}

interface User {
    id: string;
    name?: string;
    latitude: number;
    longitude: number;
    // 필요한 경우 더 많은 사용자 속성 추가
}

function HairSalon() {
    const [salons, setSalons] = useState<Salon[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [nearbySalons, setNearbySalons] = useState<Salon[]>([]);
    const [mapLoaded, setMapLoaded] = useState<boolean>(false);
    const mapRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    const handleSalonClick = (salonId: string): void => {
        navigate(`/salon/${salonId}`);
    };

    const renderStars = (score: number) => {
        const stars: React.ReactNode[] = [];
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
    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
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
    const findNearbySalons = (userLocation: UserLocation, salons: Salon[]): Salon[] => {
        const maxDistance = 10; // 10km 이내의 미용실만 표시

        return salons.filter(salon => {
            const distance = calculateDistance(
                userLocation.latitude,
                userLocation.longitude,
                salon.latitude,
                salon.longitude
            );
            salon.distance = distance;
            return distance <= maxDistance;
        }).sort((a, b) => (a.distance || 0) - (b.distance || 0));
    };

    const initMap = (userLocation: UserLocation, salonsWithPhotos: Salon[]): void => {
        if (!window.naver || !mapRef.current) return;

        const mapOptions = {
            center: new window.naver.maps.LatLng(userLocation.latitude, userLocation.longitude),
            zoom: 12,
            zoomControl: true,
            zoomControlOptions: {
                position: window.naver.maps.Position.TOP_RIGHT
            }
        };

        const map = new window.naver.maps.Map(mapRef.current, mapOptions);

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

            const infoContent = `
                <div style="padding: 10px; width: 200px;">
                    <h3 style="margin-top: 0;">${salon.name}</h3>
                    <p>${salon.address || '주소 정보 없음'}</p>
                    <p>평점: ${salon.score || 'N/A'}</p>
                    <p>거리: ${salon.distance?.toFixed(1)}km</p>
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
        const script = document.createElement('script');
        script.src = `https://openapi.map.naver.com/openapi/v3/maps.js?ncpClientId=cv8i9hdmhu`;
        script.async = true;
        script.onload = () => setMapLoaded(true);
        document.head.appendChild(script);

        const fetchData = async (): Promise<void> => {
            try {
                setLoading(true);

                // 1. 로그인한 사용자 정보 가져오기 (없으면 기본 위치 사용)
                let userLocation: UserLocation = {
                    latitude: 37.5665, // 서울 시청 좌표(기본값)
                    longitude: 126.9780
                };

                try {
                    const userResponse = await axios.get('/api/user/me');
                    if (userResponse.status === 200) {
                        const userData = userResponse.data;
                        // 사용자에게 위치 정보가 있으면 사용, 없으면 기본값 유지
                        if (userData.latitude && userData.longitude) {
                            userLocation = {
                                latitude: userData.latitude,
                                longitude: userData.longitude
                            };
                        }

                        setCurrentUser({
                            id: userData.id,
                            name: userData.firstName + ' ' + userData.lastName,
                            ...userLocation
                        });
                    }
                } catch {
                    console.log('로그인한 사용자 정보가 없습니다. 기본 위치를 사용합니다.');
                    // 기본 사용자 객체 설정
                    setCurrentUser({
                        id: 'guest',
                        name: '게스트',
                        ...userLocation
                    });
                }

                // 2. 미용실 목록 가져오기
                const salonsResponse = await axios.get('/api/salon');

                if (salonsResponse.status === 200) {
                    const salonsWithPhotos = salonsResponse.data.map((salon: any) => ({
                        id: salon.id,
                        name: salon.name,
                        address: salon.address,
                        call_number: salon.callNumber || salon.call_number,
                        introduction: salon.introduction,
                        holiday_mask: salon.holidayMask || salon.holiday_mask,
                        start_time: salon.startTime || salon.start_time,
                        end_time: salon.endTime || salon.end_time,
                        score: salon.score,
                        latitude: salon.latitude,
                        longitude: salon.longitude,
                        // 백엔드에서 사진 정보를 제공하는 경우 사용
                        photos: salon.photos?.map((photo: any) => ({
                            photoId: photo.photoId,
                            photoUrl: photo.photoUrl,
                            photoOrder: photo.photoOrder
                        })) || [
                            {
                                photoId: 1,
                                photoUrl: salon1Image,
                                photoOrder: 1
                            }
                        ]
                    }));

                    setSalons(salonsWithPhotos);
                } else {
                    throw new Error('미용실 데이터를 가져오는데 실패했습니다.');
                }

                setLoading(false);
            } catch (err) {
                console.error('데이터 불러오기 오류:', err);
                setError('데이터를 불러오는데 실패했습니다.');
                setLoading(false);

                // 기본 사용자 설정
                setCurrentUser({
                    id: 'guest',
                    name: '게스트',
                    latitude: 37.5665,
                    longitude: 126.9780
                });
            }
        };

        fetchData();

        return () => {
            if (script.parentNode) {
                document.head.removeChild(script);
            }
        };
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
                                        <p>{salon.distance?.toFixed(1)}km</p>
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