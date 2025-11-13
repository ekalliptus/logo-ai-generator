import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

/**
 * Login page component
 */
export function LoginPage() {
  const { signInWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);

    const result = await signInWithGoogle();

    if (result.success) {
      // Success! onAuthStateChanged will handle the rest
      // Loading state will be managed by the auth context
    } else {
      setError(result.error || 'Failed to sign in. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <Card className="max-w-md w-full text-center">
        {/* Logo */}
        <div className="mb-6">
          <img
            src="/logo-ekalliptus.webp"
            alt="Ekalliptus"
            className="h-20 mx-auto mb-4"
          />
          <h1 className="text-3xl font-bold gradient-text mb-2">
            Logo AI Generator
          </h1>
          <p className="text-gray-600">
            Powered by Gemini AI
          </p>
        </div>

        {/* Description */}
        <div className="mb-8">
          <p className="text-gray-700 mb-4">
            Generate professional logos with AI in seconds
          </p>

          {/* Features */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
            <h3 className="font-semibold text-gray-800 mb-3">Features:</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start">
                <span className="text-primary mr-2">✓</span>
                <span>Multiple logo style options</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-2">✓</span>
                <span>4 variations per generation</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-2">✓</span>
                <span>Custom color palettes</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-2">✓</span>
                <span>Batch download & history</span>
              </li>
            </ul>
          </div>

          {/* Tier comparison */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
              <div className="font-semibold text-gray-800 mb-1">Free Tier</div>
              <div className="text-2xl font-bold text-primary">5</div>
              <div className="text-gray-600">generations/day</div>
            </div>
            <div className="bg-gradient-to-br from-primary to-primary-light rounded-lg p-3 text-white">
              <div className="font-semibold mb-1">Pro Tier</div>
              <div className="text-2xl font-bold">100</div>
              <div className="opacity-90">generations/day</div>
            </div>
          </div>
        </div>

        {/* Sign in button */}
        <Button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3"
        >
          {loading ? (
            <span>Signing in...</span>
          ) : (
            <>
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span>Sign in with Google</span>
            </>
          )}
        </Button>

        {/* Error message */}
        {error && (
          <div className="mt-4 p-3 bg-red-100 text-red-800 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Footer */}
        <p className="mt-6 text-xs text-gray-500">
          By signing in, you agree to our Terms of Service and Privacy Policy
        </p>
      </Card>
    </div>
  );
}
