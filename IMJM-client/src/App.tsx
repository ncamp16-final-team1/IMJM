import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Home from './pages/Home/Home';
import SalonDetail from "./pages/HairSalon/SalonDetail";
import HairSalon from "./pages/HairSalon/HairSalon";
import Login from './pages/User/Login';
import UserDetailRegister from './pages/User/UserDetailRegister';
import UserTypeSelect from './pages/User/UserTypeSelect';

import { useMemo } from 'react';

function LayoutWrapper({ children }: { children: React.ReactNode }) {
    const location = useLocation();

    const isAuthPage = useMemo(() =>
        location.pathname.startsWith('/user/login') ||
        location.pathname.startsWith('/user/register') ||
        location.pathname.startsWith('/user/register/step1')
        , [location.pathname]);

    return (
        <div className="app-container">
            {!isAuthPage && <Header />}
            <main className="content-area">{children}</main>
            {!isAuthPage && <Footer />}
        </div>
    );
}

function App() {
    return (
        <BrowserRouter>
            <LayoutWrapper>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/hairSalon" element={<HairSalon />} />
                    <Route path="/archive" element={<div>Archive Page (준비 중)</div>} />
                    <Route path="/community" element={<div>Community Page (준비 중)</div>} />
                    <Route path="/myPage" element={<div>My Page (준비 중)</div>} />
                    <Route path="/salon/:id" element={<SalonDetail />} />
                    <Route path="/user/login" element={<Login />} />
                    <Route path="/user/register" element={<UserTypeSelect />} />
                    <Route path="/user/register/step1" element={<UserDetailRegister />} />
                </Routes>
            </LayoutWrapper>
        </BrowserRouter>
    );
}

export default App;