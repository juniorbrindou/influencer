import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { VoteProvider } from './context/VoteContext';
import Header from './components/Header';
import Footer from './components/Footer';
import ConfirmationPage from './pages/ConfirmationPage';
import ResultsPage from './pages/ResultsPage';
import AdminPage from './pages/AdminPage';
import HomePage from './pages/HomePage';
import CategoryPage from './pages/CategoryPage';
import NotFoundPage from './pages/NotFoundPage'; // Vous devrez créer ce composant
import ForegroundAnimation from './components/AnimatedBackground';

function App() {
  return (
    <VoteProvider>
      <Router>
        <div className="min-h-screen flex flex-col relative">
          <Header />
          <main className="flex-grow z-10">
            <Routes>
              <Route path="/" element={<div className="foreground-content"><HomePage /></div>} />
              <Route path="/category/:id" element={<div className="foreground-content dark-bg-page"><CategoryPage /></div>} />
              <Route path="/confirmation" element={<div className="foreground-content"><ConfirmationPage /></div>} />
              <Route path="/ia-results" element={<div className="foreground-content"><ResultsPage /></div>} />
              <Route path="/ia" element={<div className="foreground-content"><AdminPage /></div>} />
              
              {/* Route 404 - Doit être la dernière */}
              <Route path="*" element={<div className="foreground-content"><NotFoundPage /></div>} />
            </Routes>
          </main>

          <Footer className='hidden md:block' />
          <ForegroundAnimation />
        </div>
      </Router>
    </VoteProvider>
  );
}

export default App;