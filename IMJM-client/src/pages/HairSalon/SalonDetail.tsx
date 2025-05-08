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
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

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

// 리뷰 답글 인터페이스 추가
interface ReviewReply {
    id: number;
    replyId: number;
    content: string;
    createdAt: string;
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
    const [showPhoneModal, setShowPhoneModal] = useState<boolean>(false);
    const [stylists, setStylists] = useState<Stylist[]>([]);
    const [serviceMenus, setServiceMenus] = useState<ServiceMenu[]>([]);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [reviewsLoading, setReviewsLoading] = useState<boolean>(false);
    const [reviewPage, setReviewPage] = useState<number>(0);
    const [hasMoreReviews, setHasMoreReviews] = useState<boolean>(true);
    const [selectedServiceType, setSelectedServiceType] = useState<string>('');
    const [serviceTypes, setServiceTypes] = useState<string[]>([]);
    // 리뷰 답글을 저장할 상태 추가
    const [reviewReplies, setReviewReplies] = useState<Record<number, ReviewReply>>({});

    // 서비스 타입이 로드되면 첫 번째 사용 가능한 타입을 초기 선택 타입으로 설정
    useEffect(() => {
        if (serviceTypes.length > 0 && selectedServiceType === '') {
            setSelectedServiceType(serviceTypes[0]);
        }
    }, [serviceTypes]);

    const isDayOff = (dayIndex: number, holidayMask: number) => {
        const bitValue = 1 << dayIndex;
        return (holidayMask & bitValue) !== 0;
    };

    const showMap = () => {
        setShowMapModal(true);
    };

    const closeMapModal = () => {
        setShowMapModal(false);
    };

    // 전화번호 모달 열기/닫기 함수 추가
    const showPhone = () => {
        setShowPhoneModal(true);
    };

    const closePhoneModal = () => {
        setShowPhoneModal(false);
    };

    const toggleBusinessHours = () => {
        setShowAllHours(!showAllHours);
    };

    const handleServiceTypeChange = (type: string) => {
        setSelectedServiceType(type);
    };

    // 리뷰를 불러오는 함수
    const fetchReviews = async (page: number = 0) => {
        try {
            setReviewsLoading(true);
            const reviewResponse = await axios.get(`/api/salon/${id}/reviews?page=${page}&size=10`);

            if (reviewResponse.status === 200) {
                const newReviews = reviewResponse.data.contents;

                // 리뷰 사진 가져오기
                const reviewsWithPhotos = await Promise.all(newReviews.map(async (review: any) => {
                    try {
                        const photosResponse = await axios.get(`/api/review/${review.id}/photos`);
                        if (photosResponse.status === 200) {
                            review.photos = photosResponse.data;
                        }
                    } catch (error) {
                        console.error(`리뷰 ${review.id}의 사진을 가져오는데 실패했습니다:`, error);
                        review.photos = [];
                    }

                    // 리뷰 답글 가져오기
                    try {
                        const replyResponse = await axios.get(`/api/review-reply`, {
                            params: { reviewId: review.id },
                        });
                        if (replyResponse.data) {
                            setReviewReplies(prev => ({
                                ...prev,
                                [review.id]: replyResponse.data
                            }));
                        }
                    } catch (error) {
                        console.error(`리뷰 ${review.id}의 답글을 가져오는데 실패했습니다:`, error);
                    }

                    return {
                        id: review.id,
                        user_id: review.userId,
                        salon_id: review.salonId,
                        reg_date: review.regDate,
                        score: review.score,
                        content: review.content,
                        review_tag: review.reviewTag,
                        reservation_id: review.reservationId,
                        user_nickname: review.userNickname,
                        photos: review.photos || []
                    };
                }));

                // 기존 리뷰에 새 리뷰 추가 (페이지가 0이면 초기화)
                setReviews(prevReviews =>
                    page === 0 ? reviewsWithPhotos : [...prevReviews, ...reviewsWithPhotos]
                );

                // 더 불러올 리뷰가 있는지 확인
                setHasMoreReviews(!reviewResponse.data.last);
                setReviewPage(page);
            }
        } catch (error) {
            console.error('리뷰 정보를 불러오는데 실패했습니다:', error);
        } finally {
            setReviewsLoading(false);
        }
    };

    // 더 많은 리뷰 불러오기
    const loadMoreReviews = () => {
        if (!reviewsLoading && hasMoreReviews) {
            fetchReviews(reviewPage + 1);
        }
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
                        score: salonData.score ?? 0,
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
                        const stylistsResponse = await axios.get(`/api/salon/stylists/${id}`);
                        if (stylistsResponse.status === 200) {
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
                            // '전체' 옵션 제거
                            const types = [...Array.from(typeSet)];
                            setServiceTypes(types);

                            setServiceMenus(serviceMenus);
                        } else {
                            setServiceMenus([]);
                        }
                    } catch (serviceMenuError) {
                        console.error('서비스 메뉴 정보를 불러오는데 실패했습니다:', serviceMenuError);
                        setServiceMenus([]);
                    }

                    // 리뷰 로드 (페이징 처리)
                    fetchReviews(0);

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

    useEffect(() => {
        const handleScroll = () => {
            if (window.innerHeight + document.documentElement.scrollTop >= document.documentElement.scrollHeight - 100) {
                loadMoreReviews();
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [reviewPage, reviewsLoading, hasMoreReviews]);

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
        const safeScore = score ?? 0;
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

    // 필터링 로직 수정 - selectedServiceType이 빈 문자열일 때 처리
    const filteredServiceMenus = selectedServiceType === ''
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
                    <span>{salon.score ?? 0} / 5</span>
                </div>
            </div>

            <div className="reservation-buttons">
                <Link to={`/salon/stylists/${id}`} className="reservation-btn calendar">
                    <CalendarTodayIcon className="btn-icon" />
                    <span>예약하기</span>
                </Link>
                <button className="reservation-btn phone" onClick={showPhone}>
                    <PhoneIcon className="btn-icon" />
                    <span>전화</span>
                </button>
                <button className="reservation-btn location" onClick={showMap}>
                    <LocationOnIcon className="btn-icon" />
                    <span>위치 보기</span>
                </button>
            </div>

            <div className="info-section">
                <div className="info-header" onClick={toggleBusinessHours}>
                    <AccessTimeIcon/>
                    <h2>운영 시간 | {salon.startTime.slice(0, 5)} ~ {salon.endTime.slice(0, 5)}</h2>
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
                                        <span className="time">{hour.open.slice(0, 5)} ~ {hour.close.slice(0, 5)}</span>
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

            {/* 스타일리스트 섹션 추가 */}
            <div className="info-section stylists-section">
                <div className="info-header stylists-header">
                    <PersonIcon/>
                    <h2>스타일리스트</h2>
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
                            {selectedServiceType === ''
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
                </div>
                <div className="reviews-list">
                    {reviews.length > 0 ? (
                        <>
                            {reviews.map((review) => (
                                <div key={review.id} className="review-item">
                                    <div className="review-header">
                                        <div className="review-title">
                                            {renderStars(review.score)}
                                        </div>
                                        <div className="review-user">
                                            {review.user_nickname ? review.user_nickname : "탈퇴한 회원입니다"} | {formatTimeAgo(review.reg_date)}
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

                                    {/* 리뷰 답글 부분 수정 */}
                                    <div className="review-salon-reply">
                                        {reviewReplies[review.id] ? (
                                            <>
                                                <div className="salon-reply-header">
                                                    <strong>{salon.name}</strong>
                                                    <span className="reply-date">
                                                        {formatTimeAgo(reviewReplies[review.id].createdAt)}
                                                    </span>
                                                </div>
                                                <div className="salon-reply-content">
                                                    <p>{reviewReplies[review.id].content}</p>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="salon-reply-header">
                                                <strong>{salon.name}</strong>
                                                <span className="no-reply">아직 살롱의 답변이 없습니다.</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {reviewsLoading && (
                                <div className="loading-more">리뷰 더 불러오는 중...</div>
                            )}
                            {!reviewsLoading && hasMoreReviews && (
                                <div className="load-more-container">
                                    <button
                                        className="load-more-button"
                                        onClick={() => loadMoreReviews()}
                                    >
                                        더 보기
                                    </button>
                                </div>
                            )}
                        </>
                    ) : (
                        <p className="no-reviews">
                            {reviewsLoading ? "리뷰 불러오는 중..." : "등록된 리뷰가 없습니다."}
                        </p>
                    )}
                </div>
            </div>

            {/* 지도 모달 */}
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

            {/* 전화번호 모달 추가 */}
            {showPhoneModal && (
                <div className="phone-modal">
                    <div className="phone-modal-content">
                        <div className="phone-header">
                            <h3>{salon.name} 연락처</h3>
                            <button className="close-btn" onClick={closePhoneModal}>×</button>
                        </div>
                        <div className="phone-number">
                            <PhoneIcon className="phone-icon" />
                            <p>{salon.callNumber}</p>
                        </div>
                        <div className="phone-actions">
                            <a href={`tel:${salon.callNumber}`} className="call-button">
                                전화 걸기
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default SalonDetail;