import { UserProfile } from '../auth/UserProfile';

/**
 * Navigation header component
 */
export function Navigation() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-24 py-3">
          <div className="flex items-center gap-3">
            <img
              src="/logo-ekalliptus.webp"
              alt="Ekalliptus"
              className="h-12"
            />
            <div className="text-2xl font-bold gradient-text">
              Logo AI Generator
            </div>
          </div>

          <UserProfile />
        </div>
      </div>
    </nav>
  );
}
