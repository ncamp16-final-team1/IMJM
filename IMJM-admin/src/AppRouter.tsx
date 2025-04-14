import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Layout from './components/layouts/Layout';
import Dashboard from './pages/dashboard/Dashboard';
import Reservation from './pages/reservation/Reservation';
import Salon from './pages/salon/Salon';
import Login from './pages/auth/Login';
import Customer from './pages/customer/Customer';
import Chat from './pages/chat/Chat';
import Review from './pages/review/Review';
import Event from './pages/event/Event';
import Register from './pages/auth/Register';

function AppRouter() {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (window.location.pathname === '/admin/register') {
            return;
        }

        const checkLogin = async () => {
            try {
                const response = await fetch('/api/check-login', {
                    credentials: 'include',
                });

                if (response.ok) {
                    setIsAuthenticated(true);
                } else {
                    setIsAuthenticated(false);
                    navigate('/login');
                }
            } catch (error) {
                console.error('로그인 상태 확인 중 오류:', error);
                setIsAuthenticated(false);
                navigate('/login');
            }
        };

        checkLogin();
    }, [navigate]);

    if (isAuthenticated === null) {
        return null;
    }

    return (
        <Routes>
            <Route path="/login" element={
                <Login onLoginSuccess={() => setIsAuthenticated(true)} />
            } />
            <Route path="/admin/register" element={<Register />} />

            <Route path="/" element={
                isAuthenticated ? <Layout /> : <Navigate to="/login" />
            }>
                <Route index element={<Dashboard />} />
                <Route path="Reservation" element={<Reservation />} />
                <Route path="Salon" element={<Salon />} />
                <Route path="Customer" element={<Customer />} />
                <Route path="Chat" element={<Chat />} />
                <Route path="Review" element={<Review />} />
                <Route path="Event" element={<Event />} />
            </Route>
        </Routes>
    );
}

export default AppRouter;