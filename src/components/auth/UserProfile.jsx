import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

/**
 * User profile dropdown component with API key management
 */
export function UserProfile() {
  const {
    user,
    userTier,
    usageData,
    signOut,
    getRemainingGenerations,
    hasApiKey,
    setGeminiApiKey,
    authenticated
  } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [showApiKeyForm, setShowApiKeyForm] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [isSettingApiKey, setIsSettingApiKey] = useState(false);
  const [apiKeyError, setApiKeyError] = useState('');
  const [apiKeySuccess, setApiKeySuccess] = useState('');

  if (!user) return null;

  const handleSignOut = async () => {
    await signOut();
    setIsOpen(false);
  };

  const handleSetApiKey = async (e) => {
    e.preventDefault();
    if (!apiKey.trim()) {
      setApiKeyError('API key is required');
      return;
    }

    setIsSettingApiKey(true);
    setApiKeyError('');
    setApiKeySuccess('');

    try {
      const result = await setGeminiApiKey(apiKey.trim());
      if (result.success) {
        setShowApiKeyForm(false);
        setApiKey('');

        // Show success message with detected tier
        const tierText = result.tier === 'pro' ? 'PRO' : 'FREE';
        setApiKeySuccess(`✅ API key validated! Tier detected: ${tierText} (${result.modelCount} models available)`);

        // Clear success message after 5 seconds
        setTimeout(() => setApiKeySuccess(''), 5000);
      } else {
        setApiKeyError(result.error || 'Failed to set API key');
      }
    } catch (error) {
      setApiKeyError('Failed to set API key. Please try again.');
    } finally {
      setIsSettingApiKey(false);
    }
  };

  const remaining = getRemainingGenerations();
  const tierColor = userTier === 'pro' ? 'bg-gradient-to-r from-primary to-primary-light' : 'bg-gray-600';

  return (
    <div className="relative">
      {/* User button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 hover:opacity-80 transition-opacity"
      >
        <img
          src={user.photoURL || '/logo-ekalliptus.webp'}
          alt={user.displayName || 'User'}
          className="w-10 h-10 rounded-full border-2 border-primary"
        />
        <div className="hidden md:block text-left">
          <div className="text-sm font-medium text-gray-800">
            {user.displayName}
          </div>
          <div className={`text-xs px-2 py-0.5 rounded-full text-white inline-block ${tierColor}`}>
            {userTier?.toUpperCase()}
          </div>
        </div>
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Menu */}
          <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
            {/* User info */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center gap-3 mb-3">
                <img
                  src={user.photoURL || '/logo-ekalliptus.webp'}
                  alt={user.displayName || 'User'}
                  className="w-12 h-12 rounded-full"
                />
                <div className="flex-1">
                  <div className="font-medium text-gray-800">
                    {user.displayName}
                  </div>
                  <div className="text-sm text-gray-600">
                    {user.email}
                  </div>
                </div>
              </div>

              {/* Tier badge */}
              <div className={`${tierColor} text-white px-3 py-2 rounded-lg text-center`}>
                <div className="text-xs font-medium">
                  {userTier === 'pro' ? 'PRO MEMBER' : 'FREE TIER'}
                </div>
                {userTier !== 'pro' && (
                  <button className="text-xs underline mt-1 hover:opacity-80">
                    Upgrade to Pro
                  </button>
                )}
              </div>
            </div>

            {/* Usage stats */}
            <div className="p-4 border-b border-gray-200">
              <div className="text-sm font-medium text-gray-800 mb-2">
                Today's Usage
              </div>

              {/* Progress bar */}
              <div className="mb-2">
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  <span>
                    {usageData?.generationsToday || 0} /{' '}
                    {userTier === 'pro' ? '100' : '5'} generations
                  </span>
                  <span className="font-medium text-primary">
                    {remaining} left
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`${tierColor} h-2 rounded-full transition-all`}
                    style={{
                      width: `${
                        ((usageData?.generationsToday || 0) /
                          (userTier === 'pro' ? 100 : 5)) *
                        100
                      }%`,
                    }}
                  />
                </div>
              </div>

              {/* Total stats */}
              <div className="text-xs text-gray-600">
                Total generations: <span className="font-medium">{usageData?.totalGenerations || 0}</span>
              </div>
            </div>

            {/* API Key Management */}
            <div className="p-4 border-b border-gray-200">
              <div className="text-sm font-medium text-gray-800 mb-2">
                Gemini API Key
              </div>

              {/* Success Message */}
              {apiKeySuccess && (
                <div className="text-xs text-green-700 bg-green-100 p-2 rounded mb-2 border border-green-200">
                  {apiKeySuccess}
                </div>
              )}

              {!authenticated ? (
                <div className="text-xs text-orange-600 bg-orange-50 p-2 rounded">
                  Please sign in to set your API key
                </div>
              ) : !hasApiKey ? (
                <div className="space-y-2">
                  <div className="text-xs text-gray-600 mb-1">
                    Set your Gemini API key to start generating logos
                  </div>
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:underline block mb-2"
                  >
                    🔗 Get your API key from Google AI Studio →
                  </a>
                  <button
                    onClick={() => setShowApiKeyForm(!showApiKeyForm)}
                    className="text-xs bg-primary text-white px-3 py-1 rounded hover:opacity-80 transition-opacity"
                  >
                    Set API Key
                  </button>
                  
                  {showApiKeyForm && (
                    <form onSubmit={handleSetApiKey} className="space-y-2">
                      <input
                        type="text"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder="AIzaSy..."
                        className="w-full text-xs border border-gray-300 rounded px-2 py-1"
                      />
                      {apiKeyError && (
                        <div className="text-xs text-red-600">{apiKeyError}</div>
                      )}
                      <div className="flex gap-2">
                        <button
                          type="submit"
                          disabled={isSettingApiKey}
                          className="text-xs bg-green-600 text-white px-3 py-1 rounded hover:opacity-80 transition-opacity disabled:opacity-50"
                        >
                          {isSettingApiKey ? 'Setting...' : 'Save'}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowApiKeyForm(false);
                            setApiKey('');
                            setApiKeyError('');
                          }}
                          className="text-xs bg-gray-600 text-white px-3 py-1 rounded hover:opacity-80 transition-opacity"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="text-xs text-green-600 bg-green-50 p-2 rounded">
                    ✓ API key configured
                  </div>
                  <button
                    onClick={() => setShowApiKeyForm(!showApiKeyForm)}
                    className="text-xs text-gray-600 hover:underline"
                  >
                    Update API Key
                  </button>
                  
                  {showApiKeyForm && (
                    <form onSubmit={handleSetApiKey} className="space-y-2">
                      <input
                        type="text"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        placeholder="AIzaSy..."
                        className="w-full text-xs border border-gray-300 rounded px-2 py-1"
                      />
                      {apiKeyError && (
                        <div className="text-xs text-red-600">{apiKeyError}</div>
                      )}
                      <div className="flex gap-2">
                        <button
                          type="submit"
                          disabled={isSettingApiKey}
                          className="text-xs bg-green-600 text-white px-3 py-1 rounded hover:opacity-80 transition-opacity disabled:opacity-50"
                        >
                          {isSettingApiKey ? 'Updating...' : 'Update'}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowApiKeyForm(false);
                            setApiKey('');
                            setApiKeyError('');
                          }}
                          className="text-xs bg-gray-600 text-white px-3 py-1 rounded hover:opacity-80 transition-opacity"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}
            </div>

            {/* Sign out */}
            <div className="p-2">
              <button
                onClick={handleSignOut}
                className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
