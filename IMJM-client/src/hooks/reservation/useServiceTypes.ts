import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Menu } from '../../type/reservation/reservation';

export const useServiceTypes = () => {
  const [showServiceType, setShowServiceType] = useState(false);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [serviceMenus, setServiceMenus] = useState<Menu[]>([]);
  const [isMenuLoading, setIsMenuLoading] = useState(false);
  const [allServiceMenus, setAllServiceMenus] = useState<Menu[]>([]);
  const [serviceTypes, setServiceTypes] = useState<string[]>([]);
  const [selectedMenuName, setSelectedMenuName] = useState<string | null>(null);
  const [selectedMenu, setSelectedMenu] = useState<string | null>(null);
  
  // 슬라이더 관련 상태
  const sliderRef = useRef<HTMLDivElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    
    setShowLeftArrow(container.scrollLeft > 0);

    const isAtEnd = container.scrollLeft + container.clientWidth >= container.scrollWidth - 5;
    setShowRightArrow(!isAtEnd);
  };

  const fetchServiceTypes = async (salonId: string | undefined) => {
    if (!salonId) {
      console.error("salonId가 없습니다.");
      return;
    }
    
    setIsMenuLoading(true);
    try {
      const response = await axios.get(`/api/salon/reservations/service-menus/${salonId}`);
      
      if (response.data && Array.isArray(response.data)) {
        const types = [...new Set(response.data.map(menu => menu.serviceType))];
        
        setServiceTypes(types);
        setAllServiceMenus(response.data); 
      } 
    } catch (error) {
      console.error("서비스 메뉴 조회 실패:", error);
    } finally {
      setIsMenuLoading(false);
    }
  };

  const handleTypeChange = (type: string) => {
    if (selectedType === type) {
      setSelectedType(null);
      setServiceMenus([]);
      setSelectedMenu(null);
      setSelectedMenuName(null);
    } else {
      setSelectedType(type);
      setSelectedMenu(null);
      setSelectedMenuName(null);
      
      const filteredMenus = allServiceMenus.filter(menu => 
        menu.serviceType === type || 
        (menu.serviceType && menu.serviceType.toLowerCase() === type.toLowerCase())
      );
      
      if (filteredMenus.length > 0) {
        setServiceMenus(filteredMenus);
      }
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!sliderRef.current) return;
    
    setIsDragging(true);
    setStartX(e.pageX - sliderRef.current.offsetLeft);
    setScrollLeft(sliderRef.current.scrollLeft);
    sliderRef.current.style.cursor = 'grabbing';
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !sliderRef.current) return;
    e.preventDefault(); 
    
    const x = e.pageX - sliderRef.current.offsetLeft;
    const walk = (x - startX) * 2; 
    sliderRef.current.scrollLeft = scrollLeft - walk;
    
    // 스크롤 위치에 따라 화살표 업데이트
    updateArrows();
  };

  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
    if (sliderRef.current) {
      sliderRef.current.style.cursor = 'grab';
    }
  };

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
    
    updateArrows();
  };

  const updateArrows = () => {
    const slider = sliderRef.current;
    if (!slider) return;
    
    setShowLeftArrow(slider.scrollLeft > 0);
    
    const isAtEnd = slider.scrollLeft + slider.clientWidth >= slider.scrollWidth - 5;
    setShowRightArrow(!isAtEnd);
  };

  const handleArrowClick = (direction: 'left' | 'right') => {
    if (!sliderRef.current) return;
    
    const scrollAmount = direction === 'left' ? -200 : 200;
    sliderRef.current.scrollBy({
      left: scrollAmount,
      behavior: 'smooth'
    });
    
    setTimeout(() => {
      updateArrows();
    }, 300); 
  };

  useEffect(() => {
    const slider = sliderRef.current;
    if (slider) {
      slider.addEventListener('scroll', handleScroll as unknown as EventListener);
      
      return () => {
        slider.removeEventListener('scroll', handleScroll as unknown as EventListener);
      };
    }
  }, []);

  useEffect(() => {
    const checkArrows = () => {
      updateArrows();
    };
    
    checkArrows(); 
    
    window.addEventListener('resize', checkArrows);
    
    return () => {
      window.removeEventListener('resize', checkArrows);
    };
  }, [serviceTypes]);

  useEffect(() => {
    if (!isMenuLoading && serviceTypes.length > 0) {
      setTimeout(() => {
        updateArrows();
      }, 100);
    }
  }, [isMenuLoading, serviceTypes]);

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
    handleArrowClick,
  };
};