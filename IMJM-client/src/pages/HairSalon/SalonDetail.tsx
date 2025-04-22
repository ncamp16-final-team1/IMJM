import {useState, useEffect} from 'react';
import {useParams, Link} from 'react-router-dom';
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

import './SalonDetail.css';


declare global {
    interface Window {
        naver: any;
    }
}

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
    callNumber: string;
    introduction: string;
    holidayMask: number;
    startTime: string;
    endTime: string;
    score: number | null;
    latitude: number;
    longitude: number;
    photoUrl?: string;
    detailAddress?: string;
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
    profile?: string;
}

interface ReviewPhoto {
    photoId: number;
    photoUrl: string;
    photoOrder: number;
    uploadDate: string;
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
    const {id} = useParams<{ id: string }>();
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

    const showMap = () => {
        setShowMapModal(true);
    };

    const closeMapModal = () => {
        setShowMapModal(false);
    };

    const toggleBusinessHours = () => {
        setShowAllHours(!showAllHours);
    };

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

                if (salonData) {
                    const salonWithDetails: Salon = {
                        ...salonData,
                        photos: [], // 빈 배열로 초기화
                        businessHours: [
                            {
                                day: "월",
                                open: salonData.startTime,
                                close: salonData.endTime
                            },
                            {
                                day: "화",
                                open: salonData.startTime,
                                close: salonData.endTime
                            },
                            {
                                day: "수",
                                open: salonData.startTime,
                                close: salonData.endTime
                            },
                            {
                                day: "목",
                                open: salonData.startTime,
                                close: salonData.endTime
                            },
                            {
                                day: "금",
                                open: salonData.startTime,
                                close: salonData.endTime
                            },
                            {
                                day: "토",
                                open: salonData.startTime,
                                close: salonData.endTime
                            },
                            {
                                day: "일",
                                open: salonData.startTime,
                                close: salonData.endTime
                            }
                        ]
                    };

                    try {
                        const photosResponse = await axios.get(`/api/salon/${id}/photos`);
                        if (photosResponse.status === 200 && photosResponse.data.length > 0) {
                            // 사진 정보 매핑
                            salonWithDetails.photos = photosResponse.data.map((photo: any) => ({
                                photoId: photo.photoId,
                                photoUrl: photo.photoUrl,
                                photoOrder: photo.photoOrder
                            })).sort((a: SalonPhoto, b: SalonPhoto) => a.photoOrder - b.photoOrder);
                        }
                    } catch (photoError) {
                        console.error('미용실 사진을 불러오는데 실패했습니다:', photoError);
                    }
                    setSalon(salonWithDetails);
                    try {
                        const stylistsResponse = await axios.get(`/api/hairsalon/stylists/${id}`);
                        if (stylistsResponse.status === 200) {
                            // 스타일리스트 데이터 형식 변환 (필요시)
                            const stylistsData = stylistsResponse.data.map((stylist: any) => ({
                                stylist_id: stylist.id || stylist.stylistId,
                                name: stylist.name,
                                salon_id: stylist.salonId || id,
                                introduction: stylist.introduction,
                                profile: stylist.profile
                            }));
                            setStylists(stylistsData);
                        } else {
                            setStylists([]);
                        }
                    } catch (stylistError) {
                        console.error('스타일리스트 정보를 불러오는데 실패했습니다:', stylistError);
                        setStylists([]);
                    }
                    try {
                        const serviceMenuResponse = await axios.get(`/api/salon/${id}/menu`);
                        if (serviceMenuResponse.status === 200) {
                            const serviceMenus = serviceMenuResponse.data;

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
                    try {
                        const reviewResponse = await axios.get(`/api/salon/${id}/reviews`);
                        if (reviewResponse.status === 200) {
                            const reviewsData = reviewResponse.data.map((review: any) => {
                                return {
                                    id: review.id,
                                    user_id: review.userId,
                                    salon_id: review.salonId,
                                    reg_date: review.regDate,
                                    score: review.score,
                                    content: review.content,
                                    review_tag: review.reviewTag,
                                    reservation_id: review.reservationId,
                                    user_nickname: '사용자',
                                    photos: []
                                };
                            });

                            const reviewsWithPhotos = await Promise.all(reviewsData.map(async (review) => {
                                try {
                                    const photosResponse = await axios.get(`/api/review/${review.id}/photos`);
                                    if (photosResponse.status === 200) {
                                        review.photos = photosResponse.data;
                                    }
                                } catch (error) {
                                    console.error(`리뷰 ${review.id}의 사진을 가져오는데 실패했습니다:`, error);
                                }
                                return review;
                            }));

                            const sortedReviews = reviewsWithPhotos.sort((a: Review, b: Review) =>
                                new Date(b.reg_date).getTime() - new Date(a.reg_date).getTime()
                            );

                            setReviews(sortedReviews);
                        } else {
                            setReviews([]);
                        }
                    } catch (reviewError) {
                        console.error('리뷰 정보를 불러오는데 실패했습니다:', reviewError);
                        setReviews([]);
                        setLoading(false);
                    }
                    setLoading(false);
                } else {
                    setError(`ID: ${id}에 해당하는 살롱을 찾을 수 없습니다.`);
                    setLoading(false);
                }
            } catch (err) {
                setError('살롱 상세 정보를 불러오는데 실패했습니다.');
                console.error('살롱 상세 정보 불러오기 오류:', err);
                setLoading(false);

                setReviews([]);
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
                    <StarIcon key={`full-${i}`} className="star-icon filled" sx={{color: '#FFD700'}}/>
                ))}
                {hasHalfStar && (
                    <StarHalfIcon className="star-icon half" sx={{color: '#FFD700'}}/>
                )}
                {[...Array(emptyStars)].map((_, i) => (
                    <StarBorderIcon key={`empty-${i}`} className="star-icon empty" sx={{color: '#FFD700'}}/>
                ))}
            </div>
        );
    };

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
            <div className="salon-gallery">
                {salon.photos && salon.photos.length > 0 ? (
                    <>
                        <div className="gallery-image">
                            <img
                                src={salon.photos[currentImageIndex].photoUrl}
                                alt={`${salon.name} 이미지 ${currentImageIndex + 1}`}
                            />
                            <button className="gallery-nav prev" onClick={prevImage}>
                                <ArrowBackIosNewIcon/>
                            </button>
                            <button className="gallery-nav next" onClick={nextImage}>
                                <ArrowForwardIosIcon/>
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="no-photos">
                        <p>등록된 사진이 없습니다.</p>
                    </div>
                )}
            </div>

            <div className="salon-header">
                <h1>{salon.name}</h1>
                <div className="salon-rating">
                    <StarIcon sx={{color: '#FFD700'}}/>
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

            <div className="info-section">
                <div className="info-header" onClick={toggleBusinessHours}>
                    <AccessTimeIcon/>
                    <h2>운영 시간 | {salon.startTime} ~ {salon.endTime}</h2>
                    <KeyboardArrowDownIcon className={showAllHours ? "rotated" : ""}/>
                </div>
                {showAllHours && (
                    <div className="business-hours-detail">
                        {salon.businessHours && salon.businessHours.map((hour, index) => (
                            <div key={index} className="hour-row">
                                <span className="day">{hour.day}
                                    {isDayOff(dayToIndex[hour.day], salon.holidayMask) ? (
                                        <span className="holiday">휴무</span>
                                    ) : (
                                        <span className="time">{hour.open} ~ {hour.close}</span>
                                    )}
                                    </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {salon.detailAddress && (
                <div className="info-section">
                    <div className="info-header">
                        <LocationOnIcon/>
                        <h2>상세 위치</h2>
                    </div>
                    <div className="detail-address-info">
                        <p>{salon.detailAddress}</p>
                    </div>
                </div>
            )}

            <div className="info-section">
                <div className="info-header">
                    <InfoIcon/>
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
                                        src={stylist.profile}
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

            <div className="info-section service-menu-section">
                <div className="info-header service-menu-header">
                    <InfoIcon/>
                    <h2>서비스 메뉴</h2>
                </div>

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
                    <StarIcon/>
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
                                            <div key={photo.photoId} className="review-photo">
                                                <img
                                                    src={photo.photoUrl}
                                                    alt={`리뷰 사진 ${photo.photoId}`}
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