
import React, { useState } from 'react';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Owners from './pages/Owners';
import Vehicles from './pages/Vehicles';
import Services from './pages/Services';
import Reports from './pages/Reports';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState('dashboard');

  const renderContent = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'owners':
        return <Owners />;
      case 'vehicles':
        return <Vehicles />;
      case 'services':
        return <Services />;
      case 'reports':
        return <Reports />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout currentPage={currentPage} onPageChange={setCurrentPage}>
      {renderContent()}
    </Layout>
  );
};

export default App;
