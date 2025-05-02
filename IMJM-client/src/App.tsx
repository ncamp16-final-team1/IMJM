// src/App.tsx (기존 App.tsx에 알림 관련 코드 추가)
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Home from './pages/Home/Home';
import SalonDetail from "./pages/HairSalon/SalonDetail";
import HairSalon from "./pages/HairSalon/HairSalon";
import Login from './pages/User/Login';
import UserDetailRegister from './pages/User/UserDetailRegister';
import UserTypeSelect from './pages/User/UserTypeSelect';
import Stylists from './pages/HairSalon/Stylists';
import StylistSchedule from './pages/HairSalon/Reservation';
import ChatMain from './pages/Chat/ChatMain';
import UserLanguageSelect from './pages/User/UserLanguageSelect';
import UserFinalSubmit from './pages/User/UserFinalSubmit';
import MyPage from './pages/MyPage/MyPage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import PublicRoute from './components/auth/PublicRoute';
import PaymentDetails from './pages/HairSalon/PaymentDetails';
import RegisterStep1 from './pages/User/RegisterStep1';
import ScrollToTop from './components/ScrollToTop';
import Appointments from './pages/MyPage/Appointments';
import WriteOrEditReview from './pages/MyPage/WriteOrEditReview.tsx';
import ViewReview from './pages/MyPage/ViewReview';
import UserProfile from './pages/MyPage/UserProfile';
import NotificationToast from './components/notification/NotificationToast';
import NotificationService from './services/notification/NotificationService';
import PointHistory from './pages/MyPage/PointHistory';
import ReservationDetail from './pages/MyPage/ReservationDetail';
import axios from 'axios';
import ArchiveWrite from "./pages/Archive/ArchiveWrite.tsx";
import ArchiveDetail from "./pages/Archive/ArchiveDetail.tsx";
import ArchiveEdit from "./pages/Archive/ArchiveEdit.tsx";
import Archive from './pages/Archive/Archive.tsx';

function App() {
    const [isInitialized, setIsInitialized] = useState<boolean>(false);

    useEffect(() => {
        // 로그인 상태 확인 및 알림 서비스 초기화
        const initializeApp = async () => {
            try {
                // 현재 사용자 정보 확인
                const userResponse = await axios.get('/api/chat/user/current');

                if (userResponse.status === 200 && userResponse.data.id) {
                    console.log('로그인된 사용자:', userResponse.data.id);

                    // 알림 서비스 초기화
                    NotificationService.initialize(userResponse.data.id);
                }
            } catch (error) {
                console.log('로그인되지 않은 상태입니다.');
            } finally {
                setIsInitialized(true);
            }
        };

        initializeApp();

        // 컴포넌트 언마운트 시 연결 해제
        return () => {
            NotificationService.disconnect();
        };
    }, []);

    return (
        <BrowserRouter>
            <div className="app-container">
                <Header />
                <main className="content-area">
                    <Routes>
                        {/* 기존 라우트들 */}
                        <Route path="/" element={<Home />} />
                        <Route path="/salon" element={<HairSalon />} />
                        <Route path="/archive" element={<Archive />} />
                        <Route path="/community" element={<div>Community Page (준비 중)</div>} />
                        <Route path="/salon/:id" element={<SalonDetail />} />

                        {/* 로그인된 사용자만 접근 가능한 경로 */}
                        <Route path="/salon/stylists/:salonId" element={
                            <ProtectedRoute>
                                <Stylists />
                            </ProtectedRoute>
                        } />
                        <Route path="/salon/:salonId/reservation/:stylistId" element={
                            <ProtectedRoute>
                                <StylistSchedule />
                            </ProtectedRoute>
                        } />
                        <Route path="/salon/:salonId/reservation/:stylistId/payment-details" element={
                            <ProtectedRoute>
                                <>
                                    <ScrollToTop />
                                    <PaymentDetails />
                                </>
                            </ProtectedRoute>
                        }
                        />
                        <Route path="/chat/*" element={
                            <ProtectedRoute>
                                <ChatMain />
                            </ProtectedRoute>
                        } />
                        <Route path="/my" element={
                            <ProtectedRoute>
                                <MyPage />
                            </ProtectedRoute>
                        } />
                        <Route path="/my/appointments" element={
                            <ProtectedRoute>
                                <Appointments />
                            </ProtectedRoute>
                        } />
                        {/* 기존 라우트 대체 */}
        <Route path="/my/write-review" element={
          <ProtectedRoute>
            <WriteOrEditReview />
          </ProtectedRoute>
        } />
        
        {/* 새 라우트 추가 */}
        <Route path="/my/review/edit" element={
          <ProtectedRoute>
            <WriteOrEditReview />
          </ProtectedRoute>
        } />
        
        {/* 기존 라우트 유지 */}
        <Route path="/my/view-review/" element={
          <ProtectedRoute>
            <ViewReview />
          </ProtectedRoute>
        } />
                        <Route path="/my/profile" element={
                            <ProtectedRoute>
                                <UserProfile />
                            </ProtectedRoute>
                        } />
                        <Route path="/my/point" element={
                            <ProtectedRoute>
                                <PointHistory />
                            </ProtectedRoute>
                        } />
                        <Route path="/my/reservation-detail/:reservationId" element={
                            <ProtectedRoute>
                                <ReservationDetail />
                            </ProtectedRoute>
                        } />
                        <Route path="/archive/write" element={
                            <ProtectedRoute>
                                <ArchiveWrite />
                            </ProtectedRoute>
                        } />
                        <Route path="/archive/:id" element={
                            <ProtectedRoute>
                                <ArchiveDetail />
                            </ProtectedRoute>
                        } />
                        <Route path="/archive/edit/:id" element={
                            <ProtectedRoute>
                                <ArchiveEdit />
                            </ProtectedRoute>
                        } />

                        {/* 로그인되지 않은 사용자만 접근 가능한 경로 */}
                        <Route path="/login" element={
                            <PublicRoute>
                                <Login />
                            </PublicRoute>
                        } />
                        <Route path="/user/language" element={
                            <UserLanguageSelect />
                        } />
                        <Route path="/user/register" element={
                            <UserTypeSelect />
                        } />
                        <Route path="/user/register/step1" element={
                            <RegisterStep1 />
                        } />
                        <Route path="/user/register/step2" element={
                            <UserDetailRegister />
                        } />
                        <Route path="/user/final" element={
                            <UserFinalSubmit />
                        } />
                    </Routes>
                </main>
                <Footer />

                {/* 전역 알림 토스트 */}
                <NotificationToast />
            </div>
        </BrowserRouter>
    );
}

export default App;
