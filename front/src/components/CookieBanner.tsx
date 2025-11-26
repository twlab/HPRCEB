import { useState, useEffect } from 'react';
import { hasConsent, setConsent } from '../utils/cookieUtils';

interface CookieBannerProps {
  nightMode: boolean;
  onShowSettings?: () => void;
}

/**
 * Cookie consent banner component that displays a notification about cookie usage
 * and allows users to accept or reject cookies.
 */
function CookieBanner({ nightMode, onShowSettings }: CookieBannerProps) {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Check if user has already made a choice about cookies
    const consent = hasConsent();
    if (consent === null) {
      // Show banner after a short delay for better UX
      const timer = setTimeout(() => {
        setShowBanner(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    setConsent('accepted');
    setShowBanner(false);
  };

  const handleReject = () => {
    setConsent('rejected');
    setShowBanner(false);
  };

  const handleCustomize = () => {
    setShowBanner(false);
    if (onShowSettings) {
      onShowSettings();
    }
  };

  if (!showBanner) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 animate-slide-up">
      <div 
        className={`${
          nightMode 
            ? 'bg-gray-800 border-gray-700' 
            : 'bg-white border-gray-200'
        } border-t shadow-2xl`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            {/* Cookie information */}
            <div className="flex-1">
              <div className="flex items-start gap-3">
                {/* Cookie icon */}
                <svg 
                  className={`w-6 h-6 flex-shrink-0 mt-0.5 ${
                    nightMode ? 'text-blue-400' : 'text-blue-600'
                  }`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth="2" 
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                
                <div>
                  <h3 
                    className={`font-semibold text-base sm:text-lg ${
                      nightMode ? 'text-gray-100' : 'text-gray-900'
                    }`}
                  >
                    Cookie Consent
                  </h3>
                  <p 
                    className={`mt-1 text-sm sm:text-base ${
                      nightMode ? 'text-gray-300' : 'text-gray-600'
                    }`}
                  >
                    We use cookies to enhance your browsing experience, save your preferences, 
                    and analyze site traffic. By clicking "Accept", you consent to our use of cookies.
                    {' '}
                    <a
                      href="https://www.humanpangenome.org/privacy-policy"
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`underline hover:no-underline ${
                        nightMode 
                          ? 'text-blue-400 hover:text-blue-300' 
                          : 'text-blue-600 hover:text-blue-700'
                      }`}
                    >
                      Learn more
                    </a>
                  </p>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto sm:flex-shrink-0">
              <div className="flex flex-row gap-2 sm:gap-3">
                <button
                  onClick={handleReject}
                  className={`flex-1 sm:flex-none px-4 sm:px-6 py-2.5 rounded-lg font-medium text-sm sm:text-base transition-all duration-200 ${
                    nightMode
                      ? 'bg-gray-700 text-gray-200 hover:bg-gray-600 border border-gray-600'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                  }`}
                  aria-label="Reject cookies"
                >
                  Reject
                </button>
                <button
                  onClick={handleCustomize}
                  className={`flex-1 sm:flex-none px-4 sm:px-6 py-2.5 rounded-lg font-medium text-sm sm:text-base transition-all duration-200 ${
                    nightMode
                      ? 'bg-gray-700 text-blue-400 hover:bg-gray-600 border border-gray-600'
                      : 'bg-white text-blue-600 hover:bg-gray-50 border border-blue-300'
                  }`}
                  aria-label="Customize cookie settings"
                >
                  Customize
                </button>
              </div>
              <button
                onClick={handleAccept}
                className={`w-full sm:w-auto px-6 py-2.5 rounded-lg font-medium text-sm sm:text-base transition-all duration-200 ${
                  nightMode
                    ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl'
                    : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl'
                }`}
                aria-label="Accept cookies"
              >
                Accept All
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CookieBanner;

