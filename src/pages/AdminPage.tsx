import React, { useState } from 'react';
import AdminLogin from '../components/AdminLogin';
import AdminDashboard from '../components/AdminDashboard';

const AdminPage: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <div className="container mx-auto px-4 py-8">
      {!isLoggedIn ? (
        <AdminLogin onLogin={() => setIsLoggedIn(true)} />
      ) : (
        <>
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-800">Panneau d'administration</h1>
            <p className="text-gray-600">
              Gérez les artistes et consultez les statistiques de vote.
            </p>
          </div>
          
          <AdminDashboard />
        </>
      )}
    </div>
  );
};

export default AdminPage;