import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const UserLanguageSelect = () => {
    const navigate = useNavigate();
    const [selectedLanguage, setSelectedLanguage] = useState('KR');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
    const handleSelect = (lang: string) => {
        setSelectedLanguage(lang);
        setIsDropdownOpen(false);
    };
    
    const handleNext = () => {
        localStorage.setItem('language', selectedLanguage);
        navigate('/user/register');
    };
  
    return (
      <div style={{ textAlign: 'center', marginTop: '100px', fontFamily: 'sans-serif' }}>
        <h2 style={{ fontSize: '30px', marginBottom: '8px' }}>언어 선택</h2>
        <p style={{ fontSize: '14px', color: '#888', marginBottom: '30px' }}>Choose your preferred language</p>
  
        <div style={{ display: 'inline-block', position: 'relative', marginBottom: '30px' }}>
        <button
          onClick={() => setIsDropdownOpen((prev) => !prev)}
          style={{
            background: 'white',
            border: '2px solid #FF9080',
            color: '#FF9080',
            fontWeight: 'bold',
            fontSize: '16px',
            padding: '10px 20px',
            borderRadius: '8px',
            cursor: 'pointer',
            width: '220px',
            height: '55px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span>{selectedLanguage === 'KR' ? 'KR 한국어' : 'EN English'}</span>
          <span style={{ fontSize: '12px', lineHeight: 1 }}>{isDropdownOpen ? '▴' : '▾'}</span>
        </button>

        {isDropdownOpen && (
          <div
            style={{
              position: 'absolute',
              top: '110%',
              left: 0,
              right: 0,
              backgroundColor: '#fff',
              border: '2px solid #FF9080',
              borderRadius: '8px',
              overflow: 'hidden',
              zIndex: 10,
            }}
          >
            <button
              onClick={() => handleSelect('KR')}
              style={{
                background: 'white',
                border: 'none',
                borderBottom: '1px solid #FF9080',
                color: '#FF9080',
                fontWeight: 'bold',
                fontSize: '16px',
                padding: '10px 20px',
                width: '100%',
                cursor: 'pointer',
              }}
            >
              KR 한국어
            </button>
            <button
              onClick={() => handleSelect('EN')}
              style={{
                background: 'white',
                border: 'none',
                color: '#FF9080',
                fontWeight: 'bold',
                fontSize: '16px',
                padding: '10px 20px',
                width: '100%',
                cursor: 'pointer',
              }}
            >
              EN English
            </button>
          </div>
        )}
      </div>

      {/* 다음 버튼 */}
      <div>
        <button
            onClick={handleNext}
            style={{
            background: 'transparent',
            border: 'none',
            color: '#FF9080',
            fontWeight: 'bold',
            fontSize: '18px',
            cursor: 'pointer',
            }}
        >
            {selectedLanguage === 'KR' ? '다음 →' : 'Next →'}
        </button>
      </div>
    </div>
  );
};

export default UserLanguageSelect;