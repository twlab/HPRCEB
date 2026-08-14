import { useState, useEffect } from 'react';
import { XMarkIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import { setConsent, setCategoryPreferences, getCategoryPreferences } from '../utils/cookieUtils';
import { BUTTON } from '../utils/theme';

interface CookieSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  nightMode: boolean;
}

interface CookiePreferences {
  strictlyNecessary: boolean; // Always true
  functional: boolean;
  analytics: boolean;
}

/**
 * Cookie Settings modal for managing detailed cookie preferences
 */
function CookieSettings({ isOpen, onClose, nightMode }: CookieSettingsProps) {
  const [preferences, setPreferences] = useState<CookiePreferences>({
    strictlyNecessary: true,
    functional: false,
    analytics: false,
  });

  useEffect(() => {
    if (isOpen) {
      const stored = getCategoryPreferences();
      setPreferences({
        strictlyNecessary: true, // Always enabled
        functional: stored.functional,
        analytics: stored.analytics,
      });
    }
  }, [isOpen]);

  const handleSave = () => {
    // Saved as chosen. Mixed choices used to be collapsed into a flat reject,
    // which turned "functional on, analytics off" into the opposite.
    setCategoryPreferences({
      functional: preferences.functional,
      analytics: preferences.analytics,
    });
    onClose();
  };

  const handleAcceptAll = () => {
    setConsent('accepted');
    onClose();
  };

  const handleRejectAll = () => {
    setConsent('rejected');
    onClose();
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div 
        className={`relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl ${
          nightMode ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-900'
        }`}
      >
        {/* Header */}
        <div className={`sticky top-0 z-10 px-6 py-4 border-b ${
          nightMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Cookie Settings</h2>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg transition-colors ${
                nightMode 
                  ? 'hover:bg-gray-700 text-gray-400 hover:text-gray-200' 
                  : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
              }`}
              aria-label="Close cookie settings"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-6 space-y-6">
          {/* Introduction */}
          <div>
            <p className={nightMode ? 'text-gray-300' : 'text-gray-600'}>
              We use cookies to enhance your browsing experience and analyze site traffic. 
              You can choose which types of cookies to allow below.
            </p>
          </div>

          {/* Strictly Necessary Cookies */}
          <div className={`p-4 rounded-lg border ${
            nightMode ? 'border-gray-700 bg-gray-700/40' : 'border-gray-200 bg-gray-50'
          }`}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-lg font-semibold">Strictly Necessary Cookies</h3>
                  <span className={`px-2 py-1 text-xs font-medium rounded ${
                    nightMode ? 'bg-primary-900/60 text-primary-200' : 'bg-primary-100 text-primary-800'
                  }`}>
                    Always Active
                  </span>
                </div>
                <p className={`text-sm ${nightMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  These cookies are essential for the website to function properly. They enable core 
                  functionality such as security, network management, and remembering your cookie preferences. 
                  These cookies cannot be disabled.
                </p>
                <div className={`mt-3 text-xs ${nightMode ? 'text-gray-500' : 'text-gray-500'}`}>
                  <strong>Cookies used:</strong> hprc_cookie_consent, hprc_cookie_prefs
                </div>
              </div>
              <div className="ml-4">
                <div className="w-12 h-6 rounded-full flex items-center px-1 bg-primary-600">
                  <div className="w-4 h-4 bg-white rounded-full transform translate-x-6 transition-transform"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Functional Cookies */}
          <div className={`p-4 rounded-lg border ${
            nightMode ? 'border-gray-700 bg-gray-700/40' : 'border-gray-200 bg-gray-50'
          }`}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-2">Functional Cookies</h3>
                <p className={`text-sm ${nightMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  These cookies enable enhanced functionality and personalization, such as saving your 
                  preferences, sessions, and providing personalized content. They may be set by us or by 
                  third-party providers.
                </p>
                <div className={`mt-3 text-xs ${nightMode ? 'text-gray-500' : 'text-gray-500'}`}>
                  <strong>Cookie used:</strong> hprc_skip_landing<br />
                  <strong>Stored in this browser:</strong> hprc_sessions (saved sessions), hprc_tutorial_completed
                </div>
              </div>
              <div className="ml-4">
                <button
                  onClick={() => setPreferences({ ...preferences, functional: !preferences.functional })}
                  className={`w-12 h-6 rounded-full flex items-center px-1 transition-colors ${
                    preferences.functional
                      ? 'bg-primary-600'
                      : nightMode ? 'bg-gray-600' : 'bg-gray-300'
                  }`}
                  aria-label="Toggle functional cookies"
                >
                  <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                    preferences.functional ? 'transform translate-x-6' : ''
                  }`}></div>
                </button>
              </div>
            </div>
          </div>

          {/* Analytics Cookies */}
          <div className={`p-4 rounded-lg border ${
            nightMode ? 'border-gray-700 bg-gray-700/40' : 'border-gray-200 bg-gray-50'
          }`}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-2">Analytics Cookies</h3>
                <p className={`text-sm ${nightMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  These cookies help us understand how visitors interact with our website by collecting 
                  and reporting information anonymously. This helps us improve the website experience.
                </p>
                <div className={`mt-3 text-xs ${nightMode ? 'text-gray-500' : 'text-gray-500'}`}>
                  <strong>Currently:</strong> Not implemented (reserved for future use)
                </div>
              </div>
              <div className="ml-4">
                <button
                  onClick={() => setPreferences({ ...preferences, analytics: !preferences.analytics })}
                  className={`w-12 h-6 rounded-full flex items-center px-1 transition-colors ${
                    preferences.analytics
                      ? 'bg-primary-600'
                      : nightMode ? 'bg-gray-600' : 'bg-gray-300'
                  }`}
                  aria-label="Toggle analytics cookies"
                >
                  <div className={`w-4 h-4 bg-white rounded-full transition-transform ${
                    preferences.analytics ? 'transform translate-x-6' : ''
                  }`}></div>
                </button>
              </div>
            </div>
          </div>

          {/* More Information */}
          <div className={`p-4 rounded-lg ${
            nightMode ? 'bg-primary-900/20 border border-primary-800' : 'bg-primary-50 border border-primary-200'
          }`}>
            <div className="flex items-start gap-3">
              <InformationCircleIcon
                className={`w-5 h-5 flex-shrink-0 mt-0.5 ${nightMode ? 'text-primary-300' : 'text-primary-600'}`}
              />
              <div>
                <p className={`text-sm ${nightMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  For more information about how we use cookies and process your data, please visit our{' '}
                  <a
                    href="https://www.humanpangenome.org/privacy-policy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`font-medium underline hover:no-underline ${
                      nightMode ? 'text-primary-300' : 'text-primary-600'
                    }`}
                  >
                    Privacy Policy
                  </a>.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer with action buttons */}
        <div className={`sticky bottom-0 px-6 py-4 border-t ${
          nightMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        }`}>
          <div className="flex flex-col sm:flex-row gap-3 justify-end">
            <button
              onClick={handleRejectAll}
              className={`px-6 py-2.5 rounded-lg font-medium transition-all duration-200 border ${
                nightMode ? `${BUTTON.secondaryDark} border-gray-600` : `${BUTTON.secondary} border-gray-300`
              }`}
            >
              Reject All
            </button>
            <button
              onClick={handleSave}
              className={`px-6 py-2.5 rounded-lg font-medium transition-all duration-200 border ${
                nightMode
                  ? 'bg-gray-700 text-primary-200 hover:bg-gray-600 border-primary-700'
                  : 'bg-white text-primary-600 hover:bg-primary-50 border-primary-300'
              }`}
            >
              Save Preferences
            </button>
            <button
              onClick={handleAcceptAll}
              className={`px-6 py-2.5 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl ${BUTTON.primary}`}
            >
              Accept All
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CookieSettings;

