import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Home from './pages/Home/Home';
import SalonDetail from "./pages/HairSalon/SalonDetail";
import HairSalon from "./pages/HairSalon/HairSalon";
import Login from './pages/User/Login';
import UserDetailRegister from './pages/User/UserDetailRegister';
import UserTypeSelect from './pages/User/UserTypeSelect';

function App() {
    return (
        <BrowserRouter>
            <div className="app-container">
                <Header />
                <main className="content-area">
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/hairSalon" element={<HairSalon />} />
                        <Route path="/archive" element={<div>Archive Page (준비 중)</div>} />
                        <Route path="/community" element={<div>Community Page (준비 중)</div>} />
                        <Route path="/myPage" element={<div>My Page (준비 중)</div>} />
                        <Route path="/salon/:id" element={<SalonDetail />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/user/login" element={<Login />} />
                        <Route path="/user/register" element={<UserTypeSelect />} />
                        <Route path="/user/register/step1" element={<UserDetailRegister />} />
                    </Routes>
                </main>
                <Footer />
            </div>
        </BrowserRouter>
    );
}

export default App;