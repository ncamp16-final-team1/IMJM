import { useState } from 'react'
import Header from './components/layout/Header.jsx'
import Footer from './components/layout/Footer.jsx'
import Home from './pages/Home/Home'

function App() {
    const [currentPage, setCurrentPage] = useState('home')

    // 현재 페이지에 따른 컴포넌트 렌더링
    const renderPage = () => {
        switch(currentPage) {
            case 'home':
                return <Home />
            default:
                return <Home />
        }
    }

    return (
        <div className="app-container">
            <Header />
            <main className="content-area">
                {renderPage()}
            </main>
            <Footer
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
            />
        </div>
    )
}

export default App;