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
              {/* Vous pouvez décommenter cette ligne quand les résultats seront disponibles */}
              {/* <Route path="/results" element={<div className="foreground-content"><ResultsPage /></div>} /> */}
              <Route path="/admin" element={<div className="foreground-content"><AdminPage /></div>} />
              
              {/* Redirection pour l'ancienne route /results */}
              <Route path="/results" element={
                <div className="foreground-content flex items-center justify-center">
                  <div className="text-center p-8 bg-black bg-opacity-80 rounded-lg max-w-2xl mx-auto">
                    <h2 className="text-2xl font-bold text-yellow-500 mb-4">Disponible prochainement</h2>
                    <p className="text-white mb-4">Les résultats seront publiés la semaine prochaine.</p>
                    <Link to="/" className="text-yellow-500 hover:underline">Retour à l'accueil</Link>
                  </div>
                </div>
              } />
              
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