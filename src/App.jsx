import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoginPage } from './components/auth/LoginPage';
import { MainApp } from './components/MainApp';
import { Spinner } from './components/ui/Spinner';

function AppContent() {
  const { user, loading, authenticated, hasApiKey } = useAuth();

  // Show loading screen
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Spinner size="xl" className="mb-4 mx-auto" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // CRITICAL FIX: Show main app as soon as we have any user (Firebase or Backend)
  // This prevents race condition where user is authenticated but stuck on login page
  if (user) {
    return <MainApp />;
  }

  // Only show login if no user at all (not authenticated)
  return <LoginPage />;
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
