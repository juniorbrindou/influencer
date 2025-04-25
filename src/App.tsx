import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { VoteProvider } from './context/VoteContext';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import ConfirmationPage from './pages/ConfirmationPage';
import ResultsPage from './pages/ResultsPage';
import AdminPage from './pages/AdminPage';

function App() {
  return (
    <VoteProvider>
      <Router>
        <div className="min-h-screen flex flex-col bg-gray-100">
          <Header />
          
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/confirmation" element={<ConfirmationPage />} />
              <Route path="/results" element={<ResultsPage />} />
              <Route path="/admin" element={<AdminPage />} />
            </Routes>
          </main>
          
          <Footer />
        </div>
      </Router>
    </VoteProvider>
  );
}

export default App;