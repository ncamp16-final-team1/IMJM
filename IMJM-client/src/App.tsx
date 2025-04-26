import { BrowserRouter, Routes, Route } from 'react-router-dom';
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
import WriteReview from './pages/MyPage/WriteReview';

function App() {
    return (
        <BrowserRouter>
            <div className="app-container">
                <Header />
                <main className="content-area">
                    <Routes>
                        {/* 로그인 여부와 상관없이 접근 가능한 경로 */}
                        <Route path="/" element={<Home />} />
                        <Route path="/salon" element={<HairSalon />} />
                        <Route path="/archive" element={<div>Archive Page (준비 중)</div>} />
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
                        <Route path="/salon/:salonId/reservation/:stylistId/paymentDetails" element={
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
                        <Route path="/myPage" element={
                            <ProtectedRoute>
                                <MyPage />
                            </ProtectedRoute>
                        } />
                        <Route path="/myPage/appointments" element={
                            <ProtectedRoute>
                                <Appointments />
                            </ProtectedRoute>
                        } />
                        <Route path="/myPage/writeReview" element={
                            <ProtectedRoute>
                                <WriteReview />
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
            </div>
        </BrowserRouter>
    );
}


export default App;