import { Cog6ToothIcon } from '@heroicons/react/24/outline';
import { FaGithub } from 'react-icons/fa6';

interface FooterProps {
  nightMode?: boolean;
  onOpenCookieSettings?: () => void;
}

export default function Footer({ nightMode = false, onOpenCookieSettings }: FooterProps) {
  return (
    <footer className={`${nightMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-t mt-12 relative overflow-hidden transition-colors duration-300`}>
      <div className={`absolute inset-0 ${nightMode ? 'bg-gradient-to-r from-blue-900/10 via-purple-900/10 to-pink-900/10' : 'bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5'}`}></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
        <div className="flex flex-col items-center gap-4">
          {/* Logo in footer */}
          <img 
            src="./logo.png" 
            alt="Human Pangenome Logo" 
            className="h-12 w-auto opacity-80 hover:opacity-100 transition-opacity"
          />
          {/* Footer text */}
          <p className={`text-center text-sm ${nightMode ? 'text-gray-300' : 'text-gray-600'} font-medium`}>
            HPRC Epigenome Browser | 
            <a 
              href="https://humanpangenome.org" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary-600 hover:text-primary-700 font-semibold hover:underline ml-1"
            >
              Learn more about HPRC →
            </a>
          </p>
          
          {/* Footer Links */}
          <div className={`flex flex-wrap items-center justify-center gap-6 text-base ${nightMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {/* Contact and Issue Tracker */}
            <a 
              href="https://github.com/twlab/HPRCEB" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:underline inline-flex items-center gap-2"
            >
              <FaGithub className="w-6 h-6" aria-hidden="true" />
              Contact & Issue Tracker
            </a>
            
            {/* Cookie Settings */}
            {onOpenCookieSettings && (
              <>
                <span className={nightMode ? 'text-gray-600' : 'text-gray-300'}>|</span>
                <button
                  onClick={onOpenCookieSettings}
                  className="hover:underline inline-flex items-center gap-2 transition-colors"
                >
                  <Cog6ToothIcon className="w-5 h-5" />
                  Cookie Settings
                </button>
              </>
            )}
          </div>
          
          {/* Wang Lab Logo and Link */}
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 w-full flex justify-center">
            <a 
              href="https://wang.wustl.edu/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 opacity-80 hover:opacity-100 transition-opacity"
            >
              <img 
                src="./wanglab_logo.png"
                alt="Wang Lab Logo" 
                className="h-10 w-auto"
              />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}


