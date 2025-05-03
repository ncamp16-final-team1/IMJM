import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

import StarIcon from '@mui/icons-material/Star';
import StarHalfIcon from '@mui/icons-material/StarHalf';
import StarOutlineIcon from '@mui/icons-material/StarOutline';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

import './HairSalon.css';

declare global {
    interface Window {
        naver: any;
        daum: any;
        kakao: any;
    }
}

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
    address?: string;
}

function HairSalon() {
    const [salons, setSalons] = useState<Salon[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [nearbySalons, setNearbySalons] = useState<Salon[]>([]);
    const [mapLoaded, setMapLoaded] = useState<boolean>(false);
    const [isScriptsLoaded, setIsScriptsLoaded] = useState<boolean>(false);
    const [currentPage, setCurrentPage] = useState<number>(0);
    const [totalPages, setTotalPages] = useState<number>(0);
    const [hasMore, setHasMore] = useState<boolean>(true);
    const [currentAddress, setCurrentAddress] = useState<string>("주소를 설정해주세요");
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

    const initMap = (userLocation: UserLocation, nearbyList: Salon[]): void => {
        if (!window.naver || !mapRef.current) return;

        if (mapRef.current) {
            mapRef.current.innerHTML = '';
        }

        // 사용자 위치를 지도 중심으로 설정
        const centerPoint = new window.naver.maps.LatLng(
            userLocation.latitude,
            userLocation.longitude
        );

        const mapOptions = {
            center: centerPoint,
            zoom: 12,
            zoomControl: true,
            zoomControlOptions: {
                position: window.naver.maps.Position.TOP_RIGHT
            }
        };

        const map = new window.naver.maps.Map(mapRef.current, mapOptions);

        // 지도가 로드된 후에 시점 조정
        window.naver.maps.Event.once(map, 'init_stylemap', () => {
            // 지도의 중심을 사용자 위치로 설정
            map.setCenter(centerPoint);

            // 지도가 위치를 아래쪽으로 조정 (마커가 하단 중앙에 오도록)
            const viewPoint = map.getProjection().fromCoordToOffset(centerPoint);
            viewPoint.y += Math.floor(mapRef.current.clientHeight / 4); // 지도 높이의 1/4만큼 아래로 이동
            const newCenter = map.getProjection().fromOffsetToCoord(viewPoint);
            map.setCenter(newCenter);
        });

        // 사용자 위치 마커 생성
        const userMarker = new window.naver.maps.Marker({
            position: centerPoint,
            map: map,
            icon: {
                content: '<div class="user-marker"><svg viewBox="0 0 24 24" fill="#FF0000" width="32px" height="32px" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"></path></svg></div>',
                anchor: new window.naver.maps.Point(16, 32)
            },
            title: '내 위치',
            zIndex: 100
        });

        if (nearbyList && nearbyList.length > 0) {
            nearbyList.forEach(salon => {
                if (!salon.latitude || !salon.longitude) return;

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

                window.naver.maps.Event.addListener(marker, 'click', () => {
                    if (infoWindow.getMap()) {
                        infoWindow.close();
                    } else {
                        infoWindow.open(map, marker);
                    }
                });
            });
        }
    };

    const saveUserLocation = async (latitude: number, longitude: number) => {
        return axios.put(`/api/user/location?latitude=${latitude}&longitude=${longitude}`);
    };

    // 주소 기반 좌표 가져오기
    const getAddressFromCoords = async (latitude: number, longitude: number) => {
        if (!window.kakao || !window.kakao.maps || !window.kakao.maps.services) {
            return "주소를 불러올 수 없습니다";
        }

        return new Promise<string>((resolve) => {
            const geocoder = new window.kakao.maps.services.Geocoder();

            geocoder.coord2Address(longitude, latitude, (result: any, status: any) => {
                if (status === window.kakao.maps.services.Status.OK) {
                    if (result[0].road_address) {
                        resolve(result[0].road_address.address_name);
                    } else if (result[0].address) {
                        resolve(result[0].address.address_name);
                    } else {
                        resolve("주소를 불러올 수 없습니다");
                    }
                } else {
                    resolve("주소를 불러올 수 없습니다");
                }
            });
        });
    };

    // 카카오 주소 API 스크립트 로드
    useEffect(() => {
        const loadScripts = () => {
            let postcodeLoaded = false;
            let kakaoScriptAppended = false;

            const checkAllReady = () => {
                if (postcodeLoaded && kakaoScriptAppended) {
                    if ((window as any).kakao && (window as any).kakao.maps) {
                        (window as any).kakao.maps.load(() => {
                            setIsScriptsLoaded(true);
                        });
                    }
                }
            };

            const postcodeScript = document.createElement('script');
            postcodeScript.src = 'https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';
            postcodeScript.async = true;
            postcodeScript.onload = () => {
                postcodeLoaded = true;
                checkAllReady();
            };

            const kakaoScript = document.createElement('script');
            kakaoScript.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=02f33a38e876dff501b53646bfead0d7&autoload=false&libraries=services`;
            kakaoScript.async = true;
            kakaoScript.onload = () => {
                kakaoScriptAppended = true;
                checkAllReady();
            };

            document.body.appendChild(postcodeScript);
            document.body.appendChild(kakaoScript);
        };

        loadScripts();

        return () => {
            const postcodeScript = document.querySelector('script[src*="postcode"]');
            const kakaoScript = document.querySelector('script[src*="dapi.kakao.com"]');

            if (postcodeScript && postcodeScript.parentNode) {
                postcodeScript.parentNode.removeChild(postcodeScript);
            }

            if (kakaoScript && kakaoScript.parentNode) {
                kakaoScript.parentNode.removeChild(kakaoScript);
            }
        };
    }, []);

    const handleAddressSearch = () => {
        const { daum, kakao } = window as any;

        if (!isScriptsLoaded || !daum?.Postcode || !kakao?.maps?.services) {
            return;
        }

        new daum.Postcode({
            oncomplete: async function (data: any) {
                let fullAddress = data.address;
                let extraAddress = '';

                if (data.addressType === 'R') {
                    if (data.bname) extraAddress += data.bname;
                    if (data.buildingName) {
                        extraAddress += (extraAddress ? ', ' : '') + data.buildingName;
                    }
                    if (extraAddress) {
                        fullAddress += ` (${extraAddress})`;
                    }
                }

                // 주소 업데이트 전에 로딩 상태 설정
                setLoading(true);

                // 주소 업데이트
                setCurrentAddress(fullAddress);

                const geocoder = new kakao.maps.services.Geocoder();

                geocoder.addressSearch(fullAddress, async function (result: any, status: any) {
                    if (status === kakao.maps.services.Status.OK) {
                        const latitude = parseFloat(result[0].y);
                        const longitude = parseFloat(result[0].x);

                        if (currentUser) {
                            const updatedUser = {
                                ...currentUser,
                                latitude,
                                longitude,
                                address: fullAddress
                            };
                            setCurrentUser(updatedUser);

                            console.log("위치정보를 업데이트합니다.");
                            try {
                                await saveUserLocation(latitude, longitude);
                                console.log("위치정보 저장 완료");
                            } catch (error) {
                                console.error("위치정보 저장 실패:", error);
                            }
                        }

                        if (mapLoaded && mapRef.current) {
                            const userLocation = { latitude, longitude };

                            initMap(userLocation, []);
                        }

                        try {
                            setCurrentPage(0);
                            setHasMore(true);

                            const params: any = {
                                page: 0,
                                size: 10,
                                userId: currentUser?.id || 'guest',
                                latitude,
                                longitude
                            };

                            const response = await axios.get('/api/salon', { params });

                            if (response.status === 200) {
                                const responseData = response.data;
                                const salonsList = responseData.content.map((salon: any) => ({
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
                                    distance: salon.distance,
                                    photos: []
                                }));

                                setTotalPages(responseData.totalPages);
                                setCurrentPage(responseData.number);
                                setHasMore(!responseData.last);

                                setSalons(salonsList);
                                setNearbySalons(salonsList);

                                const salonsWithPhotos = await Promise.all(
                                    salonsList.map(async (salon: Salon) => {
                                        try {
                                            const photosResponse = await axios.get(`/api/salon/${salon.id}/photos`);
                                            if (photosResponse.status === 200 && photosResponse.data.length > 0) {
                                                salon.photos = photosResponse.data.map((photo: any) => ({
                                                    photoId: photo.photoId,
                                                    photoUrl: photo.photoUrl,
                                                    photoOrder: photo.photoOrder
                                                }));
                                            }
                                        } catch (error) {
                                            console.warn(`${salon.id} 미용실의 사진을 가져오는데 실패했습니다:`, error);
                                        }
                                        return salon;
                                    })
                                );

                                setSalons(salonsWithPhotos);
                                setNearbySalons(salonsWithPhotos);

                                if (mapLoaded && mapRef.current) {
                                    const userLocation = { latitude, longitude };
                                    initMap(userLocation, salonsWithPhotos);
                                }
                            }

                        } catch{
                            setError("새 위치에서 미용실을 검색하는데 실패했습니다.");
                        } finally {
                            setLoading(false);
                        }
                    } else {
                        setLoading(false);
                        setError("주소 좌표를 가져오는데 실패했습니다.");
                    }
                });
            },
        }).open();
    };

    const fetchNearbySalons = async (userId: string, latitude?: number, longitude?: number, page: number = 0) => {
        try {
            setLoading(true);

            const params: any = {
                page,
                size: 10
            };

            if (userId) {
                params.userId = userId;
            }

            if (latitude !== undefined && longitude !== undefined) {
                params.latitude = latitude;
                params.longitude = longitude;
            }

            console.log(params)
            const response = await axios.get('/api/salon', { params });

            if (response.status === 200) {
                const responseData = response.data;
                console.log(`총 미용실 수: ${responseData.content.length}, 총 페이지: ${responseData.totalPages}`);

                const salonsList = responseData.content.map((salon: any) => ({
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
                    distance: salon.distance,
                    photos: []
                }));

                setTotalPages(responseData.totalPages);
                setCurrentPage(responseData.number);
                setHasMore(!responseData.last);

                if (page === 0) {
                    setSalons(salonsList);
                    setNearbySalons(salonsList); // 첫 페이지는 가까운 미용실로 설정
                } else {
                    setSalons(prev => [...prev, ...salonsList]);
                }

                const salonsWithPhotos = await Promise.all(
                    salonsList.map(async (salon: Salon) => {
                        try {
                            const photosResponse = await axios.get(`/api/salon/${salon.id}/photos`);
                            if (photosResponse.status === 200 && photosResponse.data.length > 0) {
                                salon.photos = photosResponse.data.map((photo: any) => ({
                                    photoId: photo.photoId,
                                    photoUrl: photo.photoUrl,
                                    photoOrder: photo.photoOrder
                                }));
                            }
                        } catch (error) {
                            console.warn(`${salon.id} 미용실의 사진을 가져오는데 실패했습니다:`, error);
                        }
                        return salon;
                    })
                );

                if (page === 0) {
                    setSalons(salonsWithPhotos);
                    setNearbySalons(salonsWithPhotos);

                    if (mapLoaded && mapRef.current && currentUser) {
                        const userLocation = {
                            latitude: currentUser.latitude,
                            longitude: currentUser.longitude
                        };
                        initMap(userLocation, salonsWithPhotos);
                    }
                } else {
                    setSalons(prev => {
                        const prevWithoutNew = prev.filter(p => !salonsWithPhotos.some(s => s.id === p.id));
                        return [...prevWithoutNew, ...salonsWithPhotos];
                    });
                }

            }
            setLoading(false);
        } catch{
            setError('미용실 데이터를 불러오는데 실패했습니다.');
            setLoading(false);
        }
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

                try {
                    const userResponse = await axios.get('/api/user/location');
                    if (userResponse.status === 200) {
                        const userData = userResponse.data;

                        const user = {
                            id: userData.id || 'guest',
                            name: userData.firstName || '게스트',
                            latitude: userData.latitude,
                            longitude: userData.longitude
                        };

                        setCurrentUser(user);

                        await fetchNearbySalons(user.id, user.latitude, user.longitude);

                        if (isScriptsLoaded && window.kakao?.maps?.services) {
                            const address = await getAddressFromCoords(user.latitude, user.longitude);
                            setCurrentAddress(address);
                        }
                    }
                } catch{
                    setError('사용자 정보를 불러오는데 실패했습니다.');
                }

                setLoading(false);
            } catch{
                setError('데이터를 불러오는데 실패했습니다.');
                setLoading(false);
            }
        };

        fetchData();

        return () => {
            if (script.parentNode) {
                document.head.removeChild(script);
            }
        };
    }, []);

    // 스크립트 로드 후 주소정보 업데이트
    useEffect(() => {
        if (isScriptsLoaded && currentUser && currentUser.latitude && currentUser.longitude) {
            getAddressFromCoords(currentUser.latitude, currentUser.longitude)
                .then(address => setCurrentAddress(address));
        }
    }, [isScriptsLoaded, currentUser]);

    // 무한 스크롤 처리 함수
    const loadMoreSalons = () => {
        if (hasMore && !loading && currentUser) {
            fetchNearbySalons(currentUser.id, currentUser.latitude, currentUser.longitude, currentPage + 1);
        }
    };

    // 스크롤 이벤트 리스너
    useEffect(() => {
        const handleScroll = () => {
            if (
                window.innerHeight + document.documentElement.scrollTop >=
                document.documentElement.scrollHeight - 100 &&
                !loading &&
                hasMore
            ) {
                loadMoreSalons();
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [loading, hasMore, currentPage, currentUser]);

    useEffect(() => {
        if (mapLoaded && mapRef.current && currentUser && currentUser.latitude && currentUser.longitude) {
            const locationData = nearbySalons.length > 0 ? nearbySalons : [];
            initMap(currentUser, locationData);
        }
    }, [mapLoaded, nearbySalons, currentUser]);

    if (loading && salons.length === 0) {
        return <div className="loading">미용실 검색 중...</div>;
    }

    if (error && salons.length === 0) {
        return <div className="error">{error}</div>;
    }

    return (
        <div className="hair-salon-container">
            <div className="location-header">
                <div className="location-info">
                    <LocationOnIcon className="location-icon" />
                    <div className="current-address">{currentAddress}</div>
                </div>
                <button className="location-change-btn" onClick={handleAddressSearch}>
                    위치변경
                    <ArrowDropDownIcon />
                </button>
            </div>

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
                                <h2>
                                    {salon.name}
                                    {salon.distance !== undefined && (
                                        <span className="salon-distance"> ({salon.distance?.toFixed(1)}km)</span>
                                    )}
                                </h2>
                                <div className="salon-business-hours">
                                    {salon.start_time && salon.end_time ? (
                                        <p>영업시간: {salon.start_time.slice(0, 5)} - {salon.end_time.slice(0, 5)}</p>
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

            {loading && <div className="loading-more">더 많은 미용실 불러오는 중...</div>}
        </div>
    );
}

export default HairSalon;