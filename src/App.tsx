import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { VoteProvider } from './context/VoteContext';
import Header from './components/Header';
import Footer from './components/Footer';
import ConfirmationPage from './pages/ConfirmationPage';
import ResultsPage from './pages/ResultsPage';
import AdminPage from './pages/AdminPage';
import HomePage from './pages/HomePage';
import CategoryPage from './pages/CategoryPage';
import AnimatedBackground from './components/AnimatedBackground';

function App() {
  return (
    <VoteProvider>
      <Router>
        <AnimatedBackground />
        {/* Fond animé */}
        <div className="animated-bg"></div>

        <div className="min-h-screen flex flex-col">
          <Header />

          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<div className="foreground-content"><HomePage /></div>} />
              <Route path="/category/:id" element={<div className="foreground-content dark-bg-page"><CategoryPage /></div>} />
              <Route path="/confirmation" element={<div className="foreground-content"><ConfirmationPage /></div>} />
              <Route path="/results" element={<div className="foreground-content"><ResultsPage /></div>} />
              <Route path="/admin" element={<div className="foreground-content"><AdminPage /></div>} />
            </Routes>
          </main>

          <Footer />
        </div>
      </Router>
    </VoteProvider>
  );
}

export default App;