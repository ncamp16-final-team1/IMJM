import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/layout/Header.jsx'
import Footer from './components/layout/Footer.jsx'
import Home from './pages/Home/Home'
import SalonDetail from "./pages/HairSalon/SalonDetail.jsx";
import HairSalon from "./pages/HairSalon/HairSalon.jsx";

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
                    </Routes>
                </main>
                <Footer />
            </div>
        </BrowserRouter>
    );
}



export default App;