import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import StarHalfIcon from '@mui/icons-material/StarHalf';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import InfoIcon from '@mui/icons-material/Info';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import PersonIcon from '@mui/icons-material/Person';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import salon1Image from "../../assets/images/salon1.jpeg";
import salon2Image from "../../assets/images/salon2.png";
import salon3Image from "../../assets/images/salon3.png";
import hair1Image from "../../assets/images/hair1.png";
import hair2Image from "../../assets/images/hair2.png";
import reviewData from "../../data/review.json";
import reviewPhotoData from "../../data/review_photos.json";
import userData from "../../data/user.json";

import './SalonDetail.css';


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

interface BusinessHour {
    day: string;
    open: string;
    close: string;
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
    detail_address?: string; // detail_address 추가
    // 추가로 사용하는 속성
    likes?: number;
    photos: SalonPhoto[];
    businessHours?: BusinessHour[];
    distance?: number;
}

interface Stylist {
    stylist_id: number;
    name: string;
    salon_id: number | string;
    introduction?: string;
}

interface ReviewPhoto {
    photo_id: number;
    review_id: number;
    photo_url: string;
    photo_order: number;
    upload_date: string;
}

interface Review {
    id: number;
    user_id: string;
    salon_id: string;
    reg_date: string;
    score: number;
    content: string;
    review_tag: string;
    reservation_id: number;
    photos?: ReviewPhoto[];
    user_nickname?: string;
}

interface ServiceMenu {
    id: number;
    serviceType: string;
    serviceName: string;
    serviceDescription: string;
    price: number;
    salon_id?: string; // 호환성을 위해 남겨둠
}

function SalonDetail() {
    const [salon, setSalon] = useState<Salon | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const { id } = useParams<{ id: string }>();
    const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
    const [showAllHours, setShowAllHours] = useState<boolean>(false);
    const [showMapModal, setShowMapModal] = useState<boolean>(false);
    const [stylists, setStylists] = useState<Stylist[]>([]); // 스타일리스트 상태 추가
    const [serviceMenus, setServiceMenus] = useState<ServiceMenu[]>([]); // 서비스 메뉴 상태 추가
    const [reviews, setReviews] = useState<Review[]>([]); // 리뷰 상태 추가
    const [selectedServiceType, setSelectedServiceType] = useState<string>('전체');
    const [serviceTypes, setServiceTypes] = useState<string[]>(['전체']);

    const isDayOff = (dayIndex: number, holidayMask: number) => {

        const bitValue = 1 << dayIndex;

        console.log(`요일 인덱스: ${dayIndex}, 비트값: ${bitValue}, 휴일마스크: ${holidayMask}, 결과: ${(holidayMask & bitValue) !== 0}`);

        return (holidayMask & bitValue) !== 0;
    };


    // 지도 표시 함수
    const showMap = () => {
        setShowMapModal(true);
    };

    // 지도 모달 닫기 함수
    const closeMapModal = () => {
        setShowMapModal(false);
    };

    const toggleBusinessHours = () => {
        setShowAllHours(!showAllHours);
    };

    // 서비스 타입 변경 핸들러 추가
    const handleServiceTypeChange = (type: string) => {
        setSelectedServiceType(type);
    };


    useEffect(() => {
        const fetchSalonDetail = async () => {
            try {
                setLoading(true);

                // 미용실 정보 가져오기
                const response = await axios.get(`/api/salon/${id}`);
                const salonData = response.data;

                // 이미지 매핑
                const imageMap: Record<string, string> = {
                    'salon1.jpeg': salon1Image,
                    'salon2.png': salon2Image,
                    'salon3.png': salon3Image,
                    'hair1.png' : hair1Image,
                    'hair2.png' : hair2Image
                };

                if (salonData) {
                    const salonWithDetails: Salon = {
                        ...salonData,
                        photos: [
                            {photoId: 1, photoUrl: imageMap[salonData.photoUrl] || salon1Image, photoOrder: 1},
                            {photoId: 2, photoUrl: salon2Image, photoOrder: 2},
                            {photoId: 3, photoUrl: salon3Image, photoOrder: 3}
                        ],
                        businessHours: [
                            { day: "월", open: salonData.startTime || salonData.start_time, close: salonData.endTime || salonData.end_time },
                            { day: "화", open: salonData.startTime || salonData.start_time, close: salonData.endTime || salonData.end_time },
                            { day: "수", open: salonData.startTime || salonData.start_time, close: salonData.endTime || salonData.end_time },
                            { day: "목", open: salonData.startTime || salonData.start_time, close: salonData.endTime || salonData.end_time },
                            { day: "금", open: salonData.startTime || salonData.start_time, close: salonData.endTime || salonData.end_time },
                            { day: "토", open: salonData.startTime || salonData.start_time, close: salonData.endTime || salonData.end_time },
                            { day: "일", open: salonData.startTime || salonData.start_time, close: salonData.endTime || salonData.end_time }
                        ]
                    };

                    setSalon(salonWithDetails);

                    // 스타일리스트 정보 가져오기
                    try {
                        const stylistsResponse = await axios.get(`/api/hairsalon/stylists/${id}`);
                        if (stylistsResponse.status === 200) {
                            // 스타일리스트 데이터 형식 변환 (필요시)
                            const stylistsData = stylistsResponse.data.map((stylist: any) => ({
                                stylist_id: stylist.id || stylist.stylistId,
                                name: stylist.name,
                                salon_id: stylist.salonId || id,
                                introduction: stylist.introduction
                            }));
                            setStylists(stylistsData);
                        } else {
                            // 스타일리스트 정보가 없을 경우
                            setStylists([]);
                        }
                    } catch (stylistError) {
                        console.error('스타일리스트 정보를 불러오는데 실패했습니다:', stylistError);
                    }

                    // 서비스 메뉴 정보 API로 가져오기
                    try {
                        const serviceMenuResponse = await axios.get(`/api/salons/${id}/menu`);
                        if (serviceMenuResponse.status === 200) {
                            const serviceMenus = serviceMenuResponse.data;

                            // 서비스 타입 목록 추출 (중복 제거)
                            const typeSet = new Set<string>();
                            serviceMenus.forEach(menu => typeSet.add(menu.serviceType));
                            const types = ['전체', ...Array.from(typeSet)];
                            setServiceTypes(types);

                            setServiceMenus(serviceMenus);
                        } else {
                            setServiceMenus([]);
                        }
                    } catch (serviceMenuError) {
                        console.error('서비스 메뉴 정보를 불러오는데 실패했습니다:', serviceMenuError);
                        setServiceMenus([]);
                    }




                    // 리뷰 정보 - 아직 API가 없으므로 임시 데이터 사용
                    const salonReviews = reviewData.filter(review => review.salon_id === id)
                        .map(review => {
                            const reviewPhotos = reviewPhotoData.filter(photo => photo.review_id === review.id);
                            const user = userData.find(user => user.id === review.user_id);
                            const userNickname = user ? user.nickname : '익명';
                            return {
                                ...review,
                                photos: reviewPhotos,
                                user_nickname: userNickname
                            };
                        })
                        .sort((a, b) => new Date(b.reg_date).getTime() - new Date(a.reg_date).getTime());

                    setReviews(salonReviews);
                    setLoading(false);
                } else {
                    setError(`ID: ${id}에 해당하는 살롱을 찾을 수 없습니다.`);
                    setLoading(false);
                }
            } catch (err) {
                setError('살롱 상세 정보를 불러오는데 실패했습니다.');
                console.error('살롱 상세 정보 불러오기 오류:', err);
                setLoading(false);

                // // 오류 발생 시 더미 데이터 사용 (개발 중에만)
                // // TODO: 프로덕션에서는 제거할 것
                // const dummySalon: Salon = {
                //     id: id || "SALON001",
                //     name: "뷰티살롱",
                //     address: "서울시 강남구 테헤란로 123",
                //     call_number: "02-555-1234",
                //     introduction: "최고의 미용 서비스를 제공합니다.",
                //     holiday_mask: 1,
                //     start_time: "09:00:00",
                //     end_time: "20:00:00",
                //     score: 4.7,
                //     latitude: 37.50637483,
                //     longitude: 127.05838392,
                //     photoUrl: "salon1.jpeg",
                //     detail_address: "4층 402호",
                //     photos: [
                //         {photoId: 1, photoUrl: salon1Image, photoOrder: 1},
                //         {photoId: 2, photoUrl: salon2Image, photoOrder: 2},
                //         {photoId: 3, photoUrl: salon3Image, photoOrder: 3}
                //     ],
                //     businessHours: [
                //         { day: "월", open: "09:00:00", close: "20:00:00" },
                //         { day: "화", open: "09:00:00", close: "20:00:00" },
                //         { day: "수", open: "09:00:00", close: "20:00:00" },
                //         { day: "목", open: "09:00:00", close: "20:00:00" },
                //         { day: "금", open: "09:00:00", close: "20:00:00" },
                //         { day: "토", open: "09:00:00", close: "20:00:00" },
                //         { day: "일", open: "09:00:00", close: "20:00:00" }
                //     ]
                // };
                // setSalon(dummySalon);

                // const salonStylists = stylistData.filter(stylist => stylist.salon_id === id);
                // setStylists(salonStylists);


                const salonReviews = reviewData.filter(review => review.salon_id === id)
                    .map(review => {
                        const reviewPhotos = reviewPhotoData.filter(photo => photo.review_id === review.id);
                        const user = userData.find(user => user.id === review.user_id);
                        const userNickname = user ? user.nickname : '익명';
                        return {
                            ...review,
                            photos: reviewPhotos,
                            user_nickname: userNickname
                        };
                    })
                    .sort((a, b) => new Date(b.reg_date).getTime() - new Date(a.reg_date).getTime());

                setReviews(salonReviews);
                setLoading(false);
            }
        };

        fetchSalonDetail();
    }, [id]);

    // 지도 api
    useEffect(() => {
        if (showMapModal && salon) {
            const script = document.createElement('script');
            script.src = `https://openapi.map.naver.com/openapi/v3/maps.js?ncpClientId=cv8i9hdmhu`;
            script.async = true;
            document.head.appendChild(script);

            script.onload = () => {
                const mapOptions = {
                    center: new window.naver.maps.LatLng(salon.latitude, salon.longitude),
                    zoom: 15,
                    zoomControl: true,
                    zoomControlOptions: {
                        position: window.naver.maps.Position.TOP_RIGHT
                    }
                };

                const map = new window.naver.maps.Map('map', mapOptions);

                // 마커 생성
                const marker = new window.naver.maps.Marker({
                    position: new window.naver.maps.LatLng(salon.latitude, salon.longitude),
                    map: map,
                    title: salon.name
                });

                const infoWindow = new window.naver.maps.InfoWindow({
                    content: `<div style="padding:10px;width:200px;text-align:center;">
                   <strong>${salon.name}</strong><br>
                   ${salon.address || ''}
                 </div>`
                });

                window.naver.maps.Event.addListener(marker, 'click', () => {
                    infoWindow.open(map, marker);
                });

                infoWindow.open(map, marker);
            };

            return () => {
                const existingScript = document.querySelector(`script[src^="https://openapi.map.naver.com"]`);
                if (existingScript && existingScript.parentNode) {
                    existingScript.parentNode.removeChild(existingScript);
                }
            };
        }
    }, [showMapModal, salon]);

    const nextImage = () => {
        if (salon && salon.photos) {
            setCurrentImageIndex((prevIndex) => (prevIndex + 1) % salon.photos.length);
        }
    };

    const prevImage = () => {
        if (salon && salon.photos) {
            setCurrentImageIndex((prevIndex) => (prevIndex - 1 + salon.photos.length) % salon.photos.length);
        }
    };

    // 별점 렌더링 함수
    const renderStars = (score: number) => {
        const fullStars = Math.floor(score);
        const hasHalfStar = score - fullStars >= 0.5;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);


        return (
            <div className="stars-container">
                {[...Array(fullStars)].map((_, i) => (
                    <StarIcon key={`full-${i}`} className="star-icon filled" sx={{ color: '#FFD700' }} />
                ))}
                {hasHalfStar && (
                    <StarHalfIcon className="star-icon half" sx={{ color: '#FFD700' }} />
                )}
                {[...Array(emptyStars)].map((_, i) => (
                    <StarBorderIcon key={`empty-${i}`} className="star-icon empty" sx={{ color: '#FFD700' }} />
                ))}
            </div>
        );
    };

    // 시간 형식화 함수 (n시간 전, n일 전 등)
    const formatTimeAgo = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (diffInSeconds < 60) {
            return '방금 전';
        } else if (diffInSeconds < 3600) {
            const minutes = Math.floor(diffInSeconds / 60);
            return `${minutes}분 전`;
        } else if (diffInSeconds < 86400) {
            const hours = Math.floor(diffInSeconds / 3600);
            return `${hours}시간 전`;
        } else if (diffInSeconds < 2592000) {
            const days = Math.floor(diffInSeconds / 86400);
            return `${days}일 전`;
        } else if (diffInSeconds < 31536000) {
            const months = Math.floor(diffInSeconds / 2592000);
            return `${months}개월 전`;
        } else {
            const years = Math.floor(diffInSeconds / 31536000);
            return `${years}년 전`;
        }
    };



    if (loading) {
        return <div className="loading-container">살롱 정보 로딩 중...</div>;
    }

    if (error) {
        return <div className="error-container">{error}</div>;
    }

    if (!salon) {
        return <div className="error-container">살롱 정보를 찾을 수 없습니다.</div>;
    }

    const dayToIndex: Record<string, number> = {
        '월': 0,
        '화': 1,
        '수': 2,
        '목': 3,
        '금': 4,
        '토': 5,
        '일': 6
    };

    const filteredServiceMenus = selectedServiceType === '전체'
        ? serviceMenus
        : serviceMenus.filter(menu => menu.serviceType === selectedServiceType);

    return (
        <div className="salon-detail-container">
            {/* 이미지 갤러리 */}
            <div className="salon-gallery">
                {salon.photos && salon.photos.length > 0 && (
                    <>
                        <div className="gallery-image">
                            <img
                                src={salon.photos[currentImageIndex].photoUrl}
                                alt={`${salon.name} 이미지 ${currentImageIndex + 1}`}
                            />
                            <button className="gallery-nav prev" onClick={prevImage}>
                                <ArrowBackIosNewIcon />
                            </button>
                            <button className="gallery-nav next" onClick={nextImage}>
                                <ArrowForwardIosIcon />
                            </button>
                        </div>
                    </>
                )}
            </div>

            <div className="salon-header">
                <h1>{salon.name}</h1>
                <div className="salon-rating">
                    <StarIcon sx={{ color: '#FFD700' }} />
                    <span>{salon.score} / 5</span>
                </div>
            </div>

            <div className="reservation-buttons">
                <button className="reservation-btn calendar">
                    <span className="icon">📅</span> Reservation
                </button>
                <button className="reservation-btn phone">
                    <span className="icon">📞</span> Reservation
                </button>
            </div>

            {/* 영업 시간 */}
            <div className="info-section">
                <div className="info-header" onClick={toggleBusinessHours}>
                    <AccessTimeIcon />
                    <h2>운영 시간 | {salon.start_time} ~ {salon.end_time}</h2>
                    <KeyboardArrowDownIcon className={showAllHours ? "rotated" : ""} />
                </div>
                {showAllHours && (
                    <div className="business-hours-detail">
                        {salon.businessHours && salon.businessHours.map((hour, index) => (
                            <div key={index} className="hour-row">
                                <span className="day">{hour.day}</span>
                                {isDayOff(dayToIndex[hour.day], salon.holiday_mask) ? (
                                    <span className="holiday">휴무</span>
                                ) : (
                                    <span className="time">{hour.open} ~ {hour.close}</span>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* 상세 주소 정보 추가 */}
            {salon.detail_address && (
                <div className="info-section">
                    <div className="info-header">
                        <LocationOnIcon />
                        <h2>상세 위치</h2>
                    </div>
                    <div className="detail-address-info">
                        <p>{salon.detail_address}</p>
                    </div>
                </div>
            )}

            {/* 매장 정보 */}
            <div className="info-section">
                <div className="info-header">
                    <InfoIcon />
                    <h2>매장 정보</h2>
                </div>
                <div className="store-info">
                    <p dangerouslySetInnerHTML={{__html: salon.introduction.replace(/\n/g, '<br>')}}></p>
                </div>
            </div>
            <div className="information-nav">
                <div className="nav-item" onClick={showMap}>
                    <LocationOnIcon/>
                    <span>location</span>
                </div>
                <div className="nav-item">
                    <PhoneIcon/>
                    <span>phone call</span>
                </div>
            </div>

            {/* 스타일리스트 섹션 추가 */}
            <div className="info-section stylists-section">
                <div className="info-header stylists-header">
                    <PersonIcon/>
                    <h2>스타일리스트</h2>
                    <Link to="/hairSalon/stylists/SALON001" className="view-all-link">
                        모두보기 <KeyboardArrowRightIcon/>
                    </Link>
                </div>
                <div className="stylists-list">
                    {stylists.length > 0 ? (
                        stylists.slice(0, 2).map((stylist) => (
                            <div key={stylist.stylist_id} className="stylist-item">
                                <div className="stylist-avatar">
                                    <img
                                        src={salon3Image}
                                        alt={stylist.name}
                                        className="stylist-profile-image"
                                    />
                                </div>
                                <div className="stylist-info">
                                    <h3 className="stylist-name">{stylist.name}</h3>
                                    <p className="stylist-position">
                                        {stylist.introduction ?
                                            stylist.introduction.split('.')[0] :
                                            "헤어 디자이너"}
                                    </p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="no-stylists">등록된 스타일리스트가 없습니다.</p>
                    )}
                </div>
            </div>

            {/* 서비스 메뉴 섹션 추가 */}
            <div className="info-section service-menu-section">
                <div className="info-header service-menu-header">
                    <InfoIcon />
                    <h2>서비스 메뉴</h2>
                    <Link to={`/services/${salon.id}`} className="view-all-link">
                        모두보기 <KeyboardArrowRightIcon/>
                    </Link>
                </div>

                {/* 서비스 타입 필터 추가 */}
                <div className="service-type-filter">
                    {serviceTypes.map((type, index) => (
                        <button
                            key={index}
                            className={`type-filter-btn ${selectedServiceType === type ? 'active' : ''}`}
                            onClick={() => handleServiceTypeChange(type)}
                        >
                            {type}
                        </button>
                    ))}
                </div>

                <div className="service-menu-list">
                    {filteredServiceMenus.length > 0 ? (
                        filteredServiceMenus.map((service) => (
                            <div key={service.id} className="service-menu-item">
                                <div className="service-info">
                                    <h3 className="service-name">{service.serviceName}</h3>
                                    <p className="service-type">{service.serviceType}</p>
                                    <p className="service-description">{service.serviceDescription}</p>
                                </div>
                                <div className="service-price">
                                    <p>{service.price.toLocaleString()}원</p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="no-services">
                            {selectedServiceType === '전체'
                                ? '등록된 서비스 메뉴가 없습니다.'
                                : `${selectedServiceType} 유형의 서비스 메뉴가 없습니다.`}
                        </p>
                    )}
                </div>
            </div>

            {/* 리뷰 섹션 추가 */}
            <div className="info-section reviews-section">
                <div className="info-header reviews-header">
                    <StarIcon />
                    <h2>리뷰</h2>
                    <Link to={`/reviews/${salon.id}`} className="view-all-link">
                        모두보기 <KeyboardArrowRightIcon/>
                    </Link>
                </div>
                <div className="reviews-list">
                    {reviews.length > 0 ? (
                        reviews.slice(0, 3).map((review) => (
                            <div key={review.id} className="review-item">
                                <div className="review-header">
                                    <div className="review-title">
                                        {renderStars(review.score)}
                                    </div>
                                    <div className="review-user">
                                        {review.user_nickname} | {formatTimeAgo(review.reg_date)}
                                    </div>
                                </div>

                                <div className="review-content">
                                    <p>{review.content}</p>
                                </div>

                                {review.photos && review.photos.length > 0 && (
                                    <div className="review-photos">
                                        {review.photos.map((photo) => (
                                            <div key={photo.photo_id} className="review-photo">
                                                <img
                                                    src={photo.photo_url}
                                                    alt={`리뷰 사진 ${photo.photo_id}`}
                                                    onError={(e) => {
                                                        // 이미지 로드 실패 시 대체 이미지 설정
                                                        const target = e.target as HTMLImageElement;
                                                        target.src = salon1Image;
                                                    }}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {review.review_tag && (
                                    <div className="review-tags">
                                        {review.review_tag.split(',').map((tag, index) => (
                                            <span key={index} className="review-tag">
                                                #{tag.trim()}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                <div className="review-salon-reply">
                                    <div className="salon-reply-header">
                                        <strong>{salon.name}</strong>
                                        <span className="reply-time">1 hour ago</span>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="no-reviews">등록된 리뷰가 없습니다.</p>
                    )}
                </div>
            </div>

            {showMapModal && (
                <div className="map-modal">
                    <div className="map-modal-content">
                        <div className="map-header">
                            <h3>{salon.name} 위치</h3>
                            <button className="close-btn" onClick={closeMapModal}>×</button>
                        </div>
                        <div className="map-container" id="map">
                            {/* 네이버 지도가 로드될 div */}
                        </div>
                        <div className="map-address">
                            <p>{salon.address}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default SalonDetail;