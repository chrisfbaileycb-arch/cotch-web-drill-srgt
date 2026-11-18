import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { FirebaseProvider } from '@/contexts/FirebaseContext';
import CheckoutModal from '@/components/features/CheckoutModal';
import HomePage from '@/pages/HomePage';
import DashboardPage from '@/pages/DashboardPage';
import NotFound from '@/pages/NotFound';

export default function App() {
  return (
    <ErrorBoundary>
      <FirebaseProvider>
        <BrowserRouter>
          <CheckoutModal />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/app" element={<DashboardPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </FirebaseProvider>
    </ErrorBoundary>
  );
}
