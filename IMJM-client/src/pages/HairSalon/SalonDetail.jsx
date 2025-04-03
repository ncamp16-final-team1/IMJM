import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
// import axios from 'axios';
import StarIcon from '@mui/icons-material/Star';
import FavoriteIcon from '@mui/icons-material/Favorite';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import InfoIcon from '@mui/icons-material/Info';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import salon1Image from "../../assets/images/salon1.jpeg";
import salon2Image from "../../assets/images/salon2.png";
import salon3Image from "../../assets/images/salon3.png";

import './SalonDetail.css';

function SalonDetail() {
    const [salon, setSalon] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { id } = useParams();
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [showAllHours, setShowAllHours] = useState(false);
    const [showMapModal, setShowMapModal] = useState(false);

    const isDayOff = (dayIndex, holidayMask) => {
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
                // 실제 API 호출 시 주석 해제
                // const response = await axios.get(`http://localhost:8080/api/salons/${id}/with-photos`);
                // setSalon(response.data);

                // 임시 데이터 (API 연결 전 테스트용)
                setTimeout(() => {
                    const mockSalon = {
                        id: id,
                        name: "해피 피시방",
                        address: "서울시 강남구 테헤란로 123",
                        call_number: "02-1234-5678",
                        introduction: "어서오세요! 😊✨",
                        holiday_mask: 6,
                        start_time: "10:00",
                        end_time: "22:00",
                        score: 4.9,
                        latitude: 37.5425,
                        longitude: 127.1402,
                        likes: 1200,
                        photos: [
                            {photoId: 1, photoUrl: salon1Image, photoOrder: 1},
                            {photoId: 2, photoUrl: salon2Image, photoOrder: 2},
                            {photoId: 3, photoUrl: salon3Image, photoOrder: 3}
                        ],
                        businessHours: [
                            { day: "월", open: "10:00", close: "21:00" },
                            { day: "화", open: "10:00", close: "21:00" },
                            { day: "수", open: "10:00", close: "21:00" },
                            { day: "목", open: "10:00", close: "21:00" },
                            { day: "금", open: "10:00", close: "21:00" },
                            { day: "토", open: "10:00", close: "21:00" },
                            { day: "일", open: "10:00", close: "21:00" }
                        ]
                    };
                    setSalon(mockSalon);
                    setLoading(false);
                }, 500);
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

                // 정보창 생성
                const infoWindow = new window.naver.maps.InfoWindow({
                    content: `<div style="padding:10px;width:200px;text-align:center;">
                   <strong>${salon.name}</strong><br>
                   ${salon.address}
                 </div>`
                });

                // 마커 클릭시 정보창 표시
                window.naver.maps.Event.addListener(marker, 'click', () => {
                    infoWindow.open(map, marker);
                });

                // 초기에 정보창 표시
                infoWindow.open(map, marker);
            };

            return () => {
                // 스크립트 제거
                const existingScript = document.querySelector(`script[src^="https://openapi.map.naver.com"]`);
                if (existingScript) {
                    document.head.removeChild(existingScript);
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
    const dayToIndex = {
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

            {/* 살롱 이름과 평점 */}
            <div className="salon-header">
                <h1>{salon.name}</h1>
                <div className="salon-rating">
                    <StarIcon sx={{ color: '#FFD700' }} />
                    <span>{salon.score} / 5</span>
                </div>
            </div>

            {/* 예약 버튼 */}
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
                                    <span className="holiday">정기휴무입니다</span>
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

            <div className="bottom-nav">
                <div className="nav-item">
                    <FavoriteIcon/>
                    <span>{salon.likes && salon.likes.toLocaleString()}</span>
                </div>
                <div className="nav-item" onClick={() => showMap(salon.latitude, salon.longitude)}>
                    <LocationOnIcon/>
                    <span>location</span>
                </div>
                <div className="nav-item">
                    <PhoneIcon/>
                    <span>phone call</span>
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