import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Layout from './components/layouts/Layout';
import Dashboard from './pages/dashboard/Dashboard';
import Reservation from './pages/reservation/Reservation';
import Salon from './pages/salon/Salon';
import Login from './pages/auth/Login';
import Customer from './pages/customer/Customer';
import AdminChat from './pages/chat/AdminChat';
import Review from './pages/review/Review';
import Event from './pages/event/Event';
import Register from './pages/auth/Register';

function AppRouter() {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
    const navigate = useNavigate();

    const isRegisterPage = window.location.pathname === '/admin/register';

    useEffect(() => {
        
        const checkLogin = async () => {
            try {
                const response = await fetch('/api/admin/check-login', {
                    credentials: 'include',
                });

                if (response.ok) {
                    setIsAuthenticated(true);
                } else {
                    setIsAuthenticated(false);
                    if (!isRegisterPage && window.location.pathname !== '/login') {
                        navigate('/login');
                    }
                }
            } catch (error) {
                console.error('로그인 상태 확인 중 오류:', error);
                setIsAuthenticated(false);
                if (!isRegisterPage && window.location.pathname !== '/login') {
                    navigate('/login');
                }
            }
        };

        checkLogin();
    }, [navigate]);

    if (!isRegisterPage && isAuthenticated === null) {
        return null;
    }

    return (
        <Routes>
            <Route path="/login" element={
                isAuthenticated ? <Navigate to="/" replace /> : <Login onLoginSuccess={() => setIsAuthenticated(true)} />
            } />
            <Route path="/admin/register" element={
                isAuthenticated ? <Navigate to="/" replace /> : <Register />
            } />
            <Route path="/" element={
                isAuthenticated ? <Layout setIsAuthenticated={setIsAuthenticated} /> : <Navigate to="/login" />
            }>
                <Route index element={<Dashboard />} />
                <Route path="reservation" element={<Reservation />} />
                <Route path="salon" element={<Salon />} />
                <Route path="customer" element={<Customer />} />
                <Route path="chat/*" element={<AdminChat />} />
                <Route path="review" element={<Review />} />
                <Route path="event" element={<Event />} />
            </Route>
        </Routes>
    );
}

export default AppRouter;