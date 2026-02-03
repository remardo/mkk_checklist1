import { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Layout } from './components/Layout';
import { LoginPage } from './components/LoginPage';
import { Dashboard } from './components/Dashboard';
import { ChecklistsPage } from './components/ChecklistsPage';
import { UploadPage } from './components/UploadPage';
import { TrackerPage } from './components/TrackerPage';
import { ReportsPage } from './components/ReportsPage';
import { OfficesPage } from './components/OfficesPage';
import { TemplatesPage } from './components/TemplatesPage';

function AppContent() {
  const { currentUser } = useApp();
  const [currentPage, setCurrentPage] = useState('dashboard');

  if (!currentUser) {
    return <LoginPage />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard onNavigate={setCurrentPage} />;
      case 'checklists':
        return <ChecklistsPage />;
      case 'upload':
        return <UploadPage />;
      case 'tracker':
        return <TrackerPage />;
      case 'reports':
        return <ReportsPage />;
      case 'offices':
        return <OfficesPage />;
      case 'templates':
        return <TemplatesPage />;
      default:
        return <Dashboard onNavigate={setCurrentPage} />;
    }
  };

  return (
    <Layout currentPage={currentPage} onNavigate={setCurrentPage}>
      {renderPage()}
    </Layout>
  );
}

export function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
