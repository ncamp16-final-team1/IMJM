// src/hooks/useServiceTypes.ts
import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Menu } from '../types/reservation';

export const useServiceTypes = () => {
  const [showServiceType, setShowServiceType] = useState(false);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [serviceMenus, setServiceMenus] = useState<Menu[]>([]);
  const [isMenuLoading, setIsMenuLoading] = useState(false);
  const [allServiceMenus, setAllServiceMenus] = useState<Menu[]>([]);
  const [serviceTypes, setServiceTypes] = useState<string[]>([]);
  const [selectedMenuName, setSelectedMenuName] = useState<string | null>(null);

  // 슬라이더 관련 상태
  const sliderRef = useRef<HTMLDivElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  // 스크롤 이벤트 핸들러
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;

    // 왼쪽 스크롤 위치가 0보다 크면 왼쪽 화살표 표시
    setShowLeftArrow(container.scrollLeft > 0);

    const isAtEnd = container.scrollLeft + container.clientWidth >= container.scrollWidth - 5;
    setShowRightArrow(!isAtEnd);
  };

  // 서비스 타입 목록 조회 함수
  const fetchServiceTypes = async (salonId: string | undefined) => {
    if (!salonId) {
      console.error("salonId가 없습니다.");
      return;
    }
    
    setIsMenuLoading(true);
    try {
      const response = await axios.get(`/api/hairsalon/reservations/service-menus/${salonId}`);
      
      if (response.data && Array.isArray(response.data)) {
        // API에서 serviceType 필드를 기준으로 중복 제거하여 타입 목록 가져오기
        const types = [...new Set(response.data.map(menu => menu.serviceType))];
        
        setServiceTypes(types);
        setAllServiceMenus(response.data); // 모든 메뉴 저장해두기
      } 
    } catch (error) {
      console.error("서비스 메뉴 조회 실패:", error);
    } finally {
      setIsMenuLoading(false);
    }
  };

  // 타입 클릭 핸들러
  const handleTypeChange = (type: string) => {
    if (selectedType === type) {
      setSelectedType(null);
      setServiceMenus([]);
    } else {
      setSelectedType(type);
      
      // 필터링 로직 - 대소문자 무시하고 비교
      const filteredMenus = allServiceMenus.filter(menu => 
        menu.serviceType === type || 
        (menu.serviceType && menu.serviceType.toLowerCase() === type.toLowerCase())
      );
      
      // 필터링된 메뉴가 있으면 설정
      if (filteredMenus.length > 0) {
        setServiceMenus(filteredMenus);
      }
    }
  };

  // 슬라이더 드래그 관련 핸들러
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!sliderRef.current) return;
    
    setIsDragging(true);
    setStartX(e.pageX - sliderRef.current.offsetLeft);
    setScrollLeft(sliderRef.current.scrollLeft);
    sliderRef.current.style.cursor = 'grabbing';
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !sliderRef.current) return;
    e.preventDefault(); // 기본 동작 방지
    
    const x = e.pageX - sliderRef.current.offsetLeft;
    const walk = (x - startX) * 2; // 스크롤 속도 조절
    sliderRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
    if (sliderRef.current) {
      sliderRef.current.style.cursor = 'grab';
    }
  };

  // 터치 이벤트 핸들러 (모바일 지원)
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!sliderRef.current) return;
    
    setIsDragging(true);
    setStartX(e.touches[0].pageX - sliderRef.current.offsetLeft);
    setScrollLeft(sliderRef.current.scrollLeft);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !sliderRef.current) return;
    
    const x = e.touches[0].pageX - sliderRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    sliderRef.current.scrollLeft = scrollLeft - walk;
  };

  // 화살표 클릭 핸들러
  const handleArrowClick = (direction: 'left' | 'right') => {
    if (!sliderRef.current) return;
    
    const scrollAmount = direction === 'left' ? -200 : 200;
    sliderRef.current.scrollBy({
      left: scrollAmount,
      behavior: 'smooth'
    });
  };

  // 컴포넌트 마운트 시 슬라이더 이벤트 등록
  useEffect(() => {
    const slider = sliderRef.current;
    if (slider) {
      slider.addEventListener('scroll', handleScroll as unknown as EventListener);
      
      return () => {
        slider.removeEventListener('scroll', handleScroll as unknown as EventListener);
      };
    }
  }, []);

  return {
    showServiceType,
    setShowServiceType,
    selectedType,
    setSelectedType,
    serviceMenus,
    setServiceMenus,
    isMenuLoading,
    allServiceMenus,
    serviceTypes,
    selectedMenuName,
    setSelectedMenuName,
    fetchServiceTypes,
    handleTypeChange,
    sliderRef,
    isDragging,
    showLeftArrow,
    showRightArrow,
    handleMouseDown,
    handleMouseMove,
    handleMouseUpOrLeave,
    handleTouchStart,
    handleTouchMove,
    handleScroll,
    handleArrowClick
  };
};