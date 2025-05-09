import React, { useEffect, useState } from 'react';
import HomeEN from './HomeEN';
import HomeKR from './HomeKR';

function Home(): React.ReactElement {
    const [language, setLanguage] = useState<string>('EN');

    useEffect(() => {
        // 로컬 스토리지에서 언어 설정 가져오기
        const savedLanguage = localStorage.getItem('language');
        if (savedLanguage) {
            setLanguage(savedLanguage);
        }

        // 언어 변경 이벤트 리스너 추가
        const handleLanguageChange = () => {
            const currentLanguage = localStorage.getItem('language');
            if (currentLanguage) {
                setLanguage(currentLanguage);
            }
        };

        window.addEventListener('languageChange', handleLanguageChange);

        // 컴포넌트 언마운트 시 리스너 제거
        return () => {
            window.removeEventListener('languageChange', handleLanguageChange);
        };
    }, []);

    // 헤더에서 언어가 변경될 때 실시간으로 반영하기 위한 이벤트 리스닝
    useEffect(() => {
        // 추가적인 이벤트 리스너를 만들어 언어 변경을 감지할 수 있음
        // 여기서는 localStorage를 사용하는 방식으로 구현

        const checkLanguage = setInterval(() => {
            const currentLanguage = localStorage.getItem('language');
            if (currentLanguage && currentLanguage !== language) {
                setLanguage(currentLanguage);
            }
        }, 1000); // 1초마다 확인

        return () => clearInterval(checkLanguage);
    }, [language]);

    return language === 'KR' ? <HomeKR /> : <HomeEN />;
}

export default Home;