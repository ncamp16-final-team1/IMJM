-- 유저 테이블에 더미 데이터 삽입
INSERT INTO "users" (id, user_type, first_name, last_name, language, email, gender, nickname, profile, birthday, region, point, is_notification, address, latitude, longitude)
VALUES
    ('user001', 'customer', 'John', 'Doe', 'en', 'john.doe@example.com', 'Male', 'johnny', 'profile.jpg', '1990-05-12', 'Seoul', 100, true, '123 Main St, Seoul', NULL, NULL),
    ('user002', 'customer', '철수', '김', 'ko', 'chulsoo.kim@example.com', 'Male', 'chulsoo', 'profile.jpg', '1990-05-12', 'Seoul', 100, true, '서울시 강남구 테헤란로 123', NULL, NULL);

-- 살롱 테이블 정보 넣기
INSERT INTO salon (
    id, password, name, corp_reg_number, address,
    call_number, introduction, holiday_mask,
    start_time, end_time, time_unit, score,
    latitude, longitude
) VALUES (
             'SALON001', 'encodedPassword', '트렌디 헤어',
             '123-45-67890', '서울시 강남구 123-45',
             '02-123-4567', '최신 트렌드의 헤어스타일', 0,
             '09:00', '20:00', 30, 4.5,
             37.5665, 126.9780
         );

-- 살롱 포토  넣기
INSERT INTO salon_photos (
    salon_id, photo_url, photo_order, upload_date
) VALUES
      ('SALON001', 'https://kr.object.ncloudstorage.com/bitcamp-74/stylist01.png', 1, CURRENT_TIMESTAMP),
      ('SALON001', 'https://kr.object.ncloudstorage.com/bitcamp-74/stylist01.png', 2, CURRENT_TIMESTAMP);

-- 스타일리스트 테이블 넣기
INSERT INTO admin_stylist (
    salon_id, name, call_number,
    start_time, end_time, holiday_mask,
    introduction, profile
) VALUES
    ('SALON001', '신동억', '010-1111-2222',
     '09:00', '17:30:', 65,
     '10년 경력의 베테랑 디자이너', 'https://kr.object.ncloudstorage.com/bitcamp-74/stylist01.png');


--  예약 더미 데이터
INSERT INTO reservation (user_id, stylist_id, reservation_date, reservation_time, service_type, service_name, price, is_paid, requirements)
VALUES
    ('user001', 1, '2025-04-15', '15:00:00', '컷트', '남성커트', 12000, true, '짧게 잘라주세요'),
    ('user002', 1, '2025-04-15', '11:00:00', '염색', '부분염색', 40000, true, '옆머리만 염색해주세요');


-- 서비스 메뉴 더미데이터
insert into service_menu(salon_id, service_type, service_name, service_description, price)
values
    ('SALON001', '커트', '남성커트', '남성전용커트입니다.', 12000),
    ('SALON001', '염색', '부분염색', '부분염색입니다.', 40000);


