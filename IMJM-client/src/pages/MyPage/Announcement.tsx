import React, { useState } from 'react';
import { Container, Typography, Box, Paper, Divider, Chip, Button, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@mui/material';
import { styled } from '@mui/system';

// 공지사항 아이템 인터페이스
interface AnnouncementItem {
    id: number;
    title: string;
    content: string;
    category: string;
    important: boolean;
    date: string;
    views: number;
}

// 스타일 컴포넌트
const StyledContainer = styled(Container)(({ theme }) => ({
    maxWidth: '900px',
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(6),
    padding: theme.spacing(3),
}));

const PageTitle = styled(Typography)(({ theme }) => ({
    fontWeight: 700,
    marginBottom: theme.spacing(1),
    color: '#333',
    fontSize: '1.75rem', // 기존 h4보다 더 작은 크기로 조정
}));

const SubTitle = styled(Typography)(({ theme }) => ({
    color: '#666',
    marginBottom: theme.spacing(3),
    fontSize: '1rem', // 부제목도 약간 작게 조정
}));

const AnnouncementPaper = styled(Paper)(({ theme }) => ({
    marginBottom: theme.spacing(3),
    borderRadius: '8px',
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
    transition: 'transform 0.2s, box-shadow 0.2s',
    cursor: 'pointer',
    '&:hover': {
        transform: 'translateY(-3px)',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    },
}));

const AnnouncementHeader = styled(Box)(({ theme }) => ({
    display: 'flex',
    justifyContent: 'space-between',
    padding: theme.spacing(2, 3),
    alignItems: 'center',
    width: '100%',
}));

// 제목 스타일 수정 - 말줄임표 처리 추가
const TitleContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    width: '65%', // 제목 영역 너비 설정
    overflow: 'hidden', // 넘치는 부분 숨김
}));

// 말줄임표 처리를 위한 제목 텍스트 스타일
const TitleText = styled(Typography)(({ theme }) => ({
    fontWeight: 600,
    fontSize: '1rem',
    whiteSpace: 'nowrap', // 줄바꿈 방지
    overflow: 'hidden', // 넘치는 부분 숨김
    textOverflow: 'ellipsis', // 말줄임표 처리
    marginLeft: theme.spacing(1), // 카테고리 칩과의 간격
}));

const AnnouncementMeta = styled(Box)(({ theme }) => ({
    display: 'flex',
    gap: theme.spacing(2),
    alignItems: 'center',
    color: '#888',
    fontSize: '0.85rem',
    flexShrink: 0, // 메타 정보 영역은 줄어들지 않도록
}));

interface CategoryChipProps {
    category: string;
}

const CategoryChip = styled(Chip)<CategoryChipProps>(({ theme, category }) => {
    const colors: Record<string, { bg: string, text: string }> = {
        '공지': { bg: '#e3f2fd', text: '#1565c0' },
        '이벤트': { bg: '#f9fbe7', text: '#827717' },
        '업데이트': { bg: '#e8f5e9', text: '#2e7d32' },
        '안내': { bg: '#fff3e0', text: '#e65100' },
    };

    const colorSet = colors[category] || { bg: '#f5f5f5', text: '#616161' };

    return {
        backgroundColor: colorSet.bg,
        color: colorSet.text,
        fontWeight: 600,
        fontSize: '0.75rem',
        height: '24px',
        flexShrink: 0, // 카테고리 칩은 줄어들지 않도록
    };
});

const ImportantBadge = styled(Chip)({
    backgroundColor: '#ffebee',
    color: '#c62828',
    fontWeight: 600,
    fontSize: '0.75rem',
    height: '24px',
    flexShrink: 0, // 중요 배지는 줄어들지 않도록
    marginRight: '8px',
});

// 임시 공지사항 데이터
const sampleAnnouncements: AnnouncementItem[] = [
    {
        id: 1,
        title: '서비스 점검 안내 (5/10 02:00 ~ 05:00)',
        content: `안녕하세요, 서비스 이용자 여러분.\n\n더 나은 서비스 제공을 위한 시스템 점검이 진행될 예정입니다.\n\n점검 일시: 2025년 5월 10일(금) 02:00 ~ 05:00 (3시간)\n점검 내용: 데이터베이스 서버 업그레이드 및 보안 패치 적용\n\n점검 시간 동안에는 서비스 이용이 일시적으로 중단됩니다. 이용에 불편을 드려 죄송합니다.\n\n더 나은 서비스로 찾아뵙겠습니다.\n감사합니다.`,
        category: '안내',
        important: true,
        date: '2025-05-08',
        views: 342
    },
    {
        id: 2,
        title: '봄맞이 이벤트 안내: 특별 할인 프로모션',
        content: `봄맞이 특별 이벤트를 진행합니다!\n\n기간: 2025년 5월 1일 ~ 5월 15일\n\n혜택:\n- 모든 상품 20% 할인\n- 신규 가입자 추가 10% 할인 쿠폰 지급\n- 친구 초대 시 양측 모두 5,000포인트 지급\n\n따스한 봄과 함께 찾아온 혜택을 놓치지 마세요!`,
        category: '이벤트',
        important: false,
        date: '2025-05-01',
        views: 527
    },
    {
        id: 3,
        title: '개인정보처리방침 개정 안내',
        content: `안녕하세요, 개인정보처리방침 개정에 대해 안내드립니다.\n\n주요 변경사항:\n1. 개인정보 보호 강화를 위한 보안 정책 추가\n2. 제3자 정보제공 항목 구체화\n3. 개인정보 파기 절차 명확화\n\n시행일: 2025년 6월 1일\n\n자세한 내용은 개인정보처리방침 페이지에서 확인하실 수 있습니다.`,
        category: '공지',
        important: true,
        date: '2025-04-30',
        views: 198
    },
    {
        id: 4,
        title: '앱 버전 3.5.0 업데이트 안내',
        content: `새로운 버전이 출시되었습니다!\n\n버전: 3.5.0\n\n주요 업데이트 내용:\n- 사용자 인터페이스 개선\n- 새로운 테마 옵션 추가\n- 검색 기능 강화\n- 다크 모드 지원\n- 버그 수정 및 성능 개선\n\n앱스토어나 플레이스토어에서 최신 버전으로 업데이트해 주세요.`,
        category: '업데이트',
        important: false,
        date: '2025-04-25',
        views: 412
    },
    {
        id: 5,
        title: '2025년 여름 휴가 고객센터 운영 안내',
        content: `안녕하세요, 2025년 여름 휴가 기간 고객센터 운영 계획을 안내드립니다.\n\n운영 축소 기간: 2025년 7월 25일 ~ 8월 5일\n운영 시간: 오전 10시 ~ 오후 4시 (주말 및 공휴일 휴무)\n\n긴급 문의는 이메일(support@example.com)로 접수해 주시기 바랍니다.\n불편을 끼쳐드려 죄송합니다.`,
        category: '안내',
        important: false,
        date: '2025-04-20',
        views: 156
    },
    {
        id: 6,
        title: '신규 서비스 출시 안내: AI 추천 시스템',
        content: `혁신적인 AI 추천 시스템이 새롭게 출시되었습니다!\n\n주요 기능:\n- 사용자 선호도 기반 맞춤형 추천\n- 실시간 인기 콘텐츠 분석\n- 취향 유사도 기반 사용자 연결\n\n지금 바로 새로운 경험을 만나보세요!`,
        category: '업데이트',
        important: false,
        date: '2025-04-15',
        views: 387
    },
    {
        id: 7,
        title: '결제 시스템 개선 및 새로운 결제 수단 추가',
        content: `더욱 편리한 결제 경험을 위해 결제 시스템이 개선되었습니다.\n\n추가된 결제 수단:\n- 카카오페이\n- 토스페이\n- 페이코\n- 네이버페이\n\n또한 결제 프로세스가 간소화되어 더 빠르고 안전한 결제가 가능합니다.\n\n이용해 주셔서 감사합니다.`,
        category: '업데이트',
        important: false,
        date: '2025-04-10',
        views: 245
    },
    {
        id: 8,
        title: '서비스 이용약관 변경 안내',
        content: `안녕하세요, 서비스 이용약관이 변경되어 안내드립니다.\n\n주요 변경사항:\n1. 서비스 이용 규정 명확화\n2. 콘텐츠 저작권 관련 조항 추가\n3. 계정 휴면 정책 변경\n\n시행일: 2025년 5월 15일\n\n자세한 내용은 서비스 이용약관 페이지에서 확인하실 수 있습니다.\n\n이용자님의 많은 관심과 이해 부탁드립니다.`,
        category: '공지',
        important: true,
        date: '2025-04-05',
        views: 176
    },
    {
        id: 9,
        title: '5월 가정의 달 특별 이벤트: 가족 공유 혜택',
        content: `5월 가정의 달을 맞이하여 특별 이벤트를 진행합니다!\n\n이벤트 기간: 2025년 5월 1일 ~ 5월 31일\n\n주요 혜택:\n1. 가족 계정 연결 시 프리미엄 멤버십 30% 할인\n2. 가족 공유 콘텐츠 확장 (최대 6인까지)\n3. 가족 전용 콘텐츠 무료 제공\n\n가족과 함께하는 특별한 시간을 응원합니다!`,
        category: '이벤트',
        important: false,
        date: '2025-04-01',
        views: 432
    },
    {
        id: 10,
        title: '지역 기반 서비스 오픈 안내',
        content: `사용자 위치 기반의 맞춤형 서비스가 새롭게 오픈되었습니다!\n\n주요 기능:\n- 내 주변 추천 장소\n- 지역별 특화 콘텐츠\n- 지역 커뮤니티 참여\n- 로컬 이벤트 정보\n\n설정 > 위치 서비스에서 기능을 활성화하시면 더욱 편리하게 이용하실 수 있습니다.`,
        category: '업데이트',
        important: false,
        date: '2025-03-25',
        views: 298
    },
    {
        id: 11,
        title: '상반기 정기 서버 점검 안내 (3/20)',
        content: `안녕하세요, 서비스 이용자 여러분.\n\n상반기 정기 서버 점검이 진행될 예정입니다.\n\n점검 일시: 2025년 3월 20일(목) 01:00 ~ 04:00 (3시간)\n점검 내용: 서버 안정화 및 성능 개선 작업\n\n점검 시간에는 서비스 이용이 제한됩니다. 이용에 불편을 드려 죄송합니다.\n\n더 안정적인 서비스로 보답하겠습니다.\n감사합니다.`,
        category: '안내',
        important: false,
        date: '2025-03-18',
        views: 215
    },
    {
        id: 12,
        title: '모바일 앱 2.0 출시 및 기능 업데이트',
        content: `완전히 새로워진 모바일 앱 2.0 버전이 출시되었습니다!\n\n주요 업데이트:\n- 새로운 UI/UX 디자인\n- 반응 속도 200% 향상\n- 오프라인 모드 지원\n- 맞춤형 알림 설정\n- 배터리 사용량 최적화\n\n앱스토어와 플레이스토어에서 지금 업데이트하세요.`,
        category: '업데이트',
        important: true,
        date: '2025-03-15',
        views: 543
    },
    {
        id: 13,
        title: '신규 사용자 가이드 안내',
        content: `서비스를 처음 이용하시는 분들을 위한 가이드가 업데이트되었습니다.\n\n가이드 내용:\n- 기본 기능 사용법\n- 계정 설정 및 보안 팁\n- 자주 묻는 질문과 답변\n- 서비스 활용 꿀팁\n\n메인 페이지 > 도움말 센터에서 확인하실 수 있습니다.\n\n편리한 서비스 이용을 위해 참고해 주세요!`,
        category: '안내',
        important: false,
        date: '2025-03-10',
        views: 187
    },
    {
        id: 14,
        title: '채팅 기능 업데이트 및 개선 사항',
        content: `채팅 서비스가 더욱 편리하게 업데이트되었습니다.\n\n개선 사항:\n- 실시간 번역 기능 추가\n- 이미지/파일 전송 용량 증가 (최대 100MB)\n- 그룹 채팅 참여자 수 확대 (최대 500명)\n- 채팅방 배경 테마 추가\n- 메시지 예약 전송 기능\n\n지금 바로 업데이트된 채팅 기능을 이용해 보세요!`,
        category: '업데이트',
        important: false,
        date: '2025-03-05',
        views: 312
    },
    {
        id: 15,
        title: '봄 시즌 콘텐츠 업데이트 안내',
        content: `봄을 맞이하여 신규 콘텐츠가 대거 업데이트되었습니다.\n\n새로운 콘텐츠:\n- 봄 시즌 한정 테마\n- 봄철 여행 추천 가이드\n- 봄 맞이 인테리어 특집\n- 봄 시즌 제철 음식 레시피\n\n메인 페이지 '봄 특집' 코너에서 지금 바로 확인하세요!`,
        category: '업데이트',
        important: false,
        date: '2025-03-01',
        views: 278
    },
    {
        id: 16,
        title: '2025년 1분기 프리미엄 회원 혜택 안내',
        content: `프리미엄 회원님들을 위한 1분기 특별 혜택을 안내드립니다.\n\n회원 혜택:\n- 전용 고객센터 이용 가능 (24시간)\n- VIP 회원 전용 콘텐츠 제공\n- 월간 무료 이용권 3장 증정\n- 파트너사 제휴 할인 20% 적용\n\n회원 페이지에서 모든 혜택을 확인하고 사용하실 수 있습니다.\n이용해 주셔서 감사합니다.`,
        category: '안내',
        important: false,
        date: '2025-02-25',
        views: 243
    }
];

const Announcement: React.FC = () => {
    const [selectedAnnouncement, setSelectedAnnouncement] = useState<AnnouncementItem | null>(null);
    const [open, setOpen] = useState(false);

    const handleClickOpen = (announcement: AnnouncementItem) => {
        setSelectedAnnouncement(announcement);
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
    };

    return (
        <StyledContainer>
            <PageTitle variant="h4">공지사항</PageTitle>
            <SubTitle variant="subtitle1">서비스 관련 중요한 안내사항을 확인하세요.</SubTitle>

            {sampleAnnouncements.map((announcement) => (
                <AnnouncementPaper key={announcement.id} onClick={() => handleClickOpen(announcement)}>
                    <AnnouncementHeader>
                        {/* 수정된 부분: 제목 영역 */}
                        <TitleContainer>
                            {announcement.important && <ImportantBadge label="중요" size="small" />}
                            <CategoryChip label={announcement.category} size="small" category={announcement.category} />
                            <TitleText>{announcement.title}</TitleText>
                        </TitleContainer>
                        <AnnouncementMeta>
                            <Box component="span">{formatDate(announcement.date)}</Box>
                            <Box component="span">조회 {announcement.views}</Box>
                        </AnnouncementMeta>
                    </AnnouncementHeader>
                    <Divider />
                </AnnouncementPaper>
            ))}

            {/* 공지사항 상세 모달 */}
            <Dialog
                open={open}
                onClose={handleClose}
                aria-labelledby="announcement-dialog-title"
                maxWidth="md"
                fullWidth
            >
                {selectedAnnouncement && (
                    <>
                        <DialogTitle id="announcement-dialog-title" sx={{ pb: 1, fontSize: '1.25rem' }}>
                            <Box display="flex" alignItems="center" gap={1} mb={1}>
                                {selectedAnnouncement.important && <ImportantBadge label="중요" size="small" />}
                                <CategoryChip label={selectedAnnouncement.category} size="small" category={selectedAnnouncement.category} />
                            </Box>
                            {/* 모달에서는 제목 전체를 보여줌 */}
                            <Box sx={{ wordBreak: 'break-word' }}>{selectedAnnouncement.title}</Box>
                            <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 1 }}>
                                {formatDate(selectedAnnouncement.date)} | 조회 {selectedAnnouncement.views}
                            </Typography>
                        </DialogTitle>
                        <Divider />
                        <DialogContent>
                            <DialogContentText sx={{ whiteSpace: 'pre-line' }}>
                                {selectedAnnouncement.content}
                            </DialogContentText>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={handleClose} variant="outlined">
                                닫기
                            </Button>
                        </DialogActions>
                    </>
                )}
            </Dialog>
        </StyledContainer>
    );
};

export default Announcement;