import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import Layout from './components/layouts/Layout';
import Dashboard from './pages/dashboard/Dashboard';
import Reservation from './pages/reservation/Reservation';
import Salon from './pages/salon/Salon';
import Login from './pages/auth/Login';
import Profile from './pages/profile/Profile';
import Customer from './pages/customer/Customer';
import Chat from './pages/chat/Chat';
import Review from './pages/review/Review';
import Event from './pages/event/Event';


function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // 로그인 성공 시 호출할 함수
    const handleLogin = () => {
        setIsAuthenticated(true);
    };

    return (
        <BrowserRouter>
            <Routes>
                {/* 로그인 경로 추가 */}
                <Route path="/login" element={
                    <Login onLoginSuccess={handleLogin} />
                } />

                {/* 인증 여부에 따라 다른 라우트로 리디렉션 */}
                <Route path="/" element={
                    isAuthenticated ? <Layout /> : <Navigate to="/login" />
                }>
                    <Route index element={<Dashboard />} />
                    <Route path="Reservation" element={<Reservation />} />
                    <Route path="Salon" element={<Salon />} />
                    <Route path="Profile" element={<Profile />} />
                    <Route path="Customer" element={<Customer />} />
                    <Route path="Chat" element={<Chat />} />
                    <Route path="Review" element={<Review />} />
                    <Route path="Event" element={<Event />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;