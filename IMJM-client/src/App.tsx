import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Home from './pages/Home/Home';
import SalonDetail from "./pages/HairSalon/SalonDetail";
import HairSalon from "./pages/HairSalon/HairSalon";
import Login from "./pages/User/Login"
import Stylists from "./pages/HairSalon/Stylists";
import StylistSchedule from "./pages/HairSalon/ReservationStylistSchedule";

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
                        <Route path="/hairSalon/stylists/:salonId" element={<Stylists />} />
                        <Route path="/hairSalon/reservation/:stylistId" element={<StylistSchedule />} />
                    </Routes>
                </main>
                <Footer />
            </div>
        </BrowserRouter>
    );
}

export default App;