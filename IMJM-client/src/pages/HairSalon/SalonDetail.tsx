import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
// import axios from 'axios';
import StarIcon from '@mui/icons-material/Star';
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
import salonData from "../../data/salon.json";
import stylistData from "../../data/stylist.json";

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

function SalonDetail() {
    const [salon, setSalon] = useState<Salon | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const { id } = useParams<{ id: string }>();
    const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
    const [showAllHours, setShowAllHours] = useState<boolean>(false);
    const [showMapModal, setShowMapModal] = useState<boolean>(false);
    const [stylists, setStylists] = useState<Stylist[]>([]); // 스타일리스트 상태 추가

    const isDayOff = (dayIndex: number, holidayMask: number) => {
        const bitValue = 1 << dayIndex;
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

    useEffect(() => {
        const fetchSalonDetail = async () => {
            try {
                setLoading(true);

                // 이미지 매핑
                const imageMap: Record<string, string> = {
                    'salon1.jpeg': salon1Image,
                    'salon2.png': salon2Image,
                    'salon3.png': salon3Image
                };

                // salon.json에서 id와 일치하는 살롱 찾기
                const foundSalon = salonData.find(salon => salon.id === id);

                if (foundSalon) {
                    const salonWithDetails: Salon = {
                        ...foundSalon,
                        photos: [
                            {photoId: 1, photoUrl: imageMap[foundSalon.photoUrl] || salon1Image, photoOrder: 1},
                            {photoId: 2, photoUrl: salon2Image, photoOrder: 2},
                            {photoId: 3, photoUrl: salon3Image, photoOrder: 3}
                        ],
                    };

                    setSalon(salonWithDetails);

                    // 해당 살롱에 속한 스타일리스트 불러오기
                    const salonStylists = stylistData.filter(stylist => stylist.salon_id === foundSalon.id);
                    setStylists(salonStylists);

                    setLoading(false);
                } else {
                    setError(`ID: ${id}에 해당하는 살롱을 찾을 수 없습니다.`);
                    setLoading(false);
                }

                // 실제 API 호출 코드 (주석 처리)
                /*
                const response = await axios.get(`http://localhost:8080/api/salons/${id}/with-photos`);
                setSalon(response.data);
                setLoading(false);
                */
            } catch (err) {
                setError('살롱 상세 정보를 불러오는데 실패했습니다.');
                console.error('살롱 상세 정보 불러오기 오류:', err);
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

    const toggleBusinessHours = () => {
        setShowAllHours(!showAllHours);
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
                    <h2>Business hours | {salon.start_time} ~ {salon.end_time}</h2>
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

            {/* 매장 정보 */}
            <div className="info-section">
                <div className="info-header">
                    <InfoIcon />
                    <h2>Store Information</h2>
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