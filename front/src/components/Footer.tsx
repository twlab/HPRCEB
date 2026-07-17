import { Cog6ToothIcon } from '@heroicons/react/24/outline';
import { FaGithub } from 'react-icons/fa6';

interface FooterProps {
  nightMode?: boolean;
  onOpenCookieSettings?: () => void;
}

export default function Footer({ nightMode = false, onOpenCookieSettings }: FooterProps) {
  return (
    <footer className={`${nightMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-t mt-8 transition-colors duration-300`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className={`flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm ${nightMode ? 'text-gray-400' : 'text-gray-500'}`}>
          <span className={`font-medium ${nightMode ? 'text-gray-300' : 'text-gray-600'}`}>HPRC Epigenome Browser</span>

          <a
            href="https://humanpangenome.org"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary-600 hover:text-primary-700 font-medium hover:underline"
          >
            HPRC
          </a>

          <a
            href="https://github.com/twlab/HPRCEB"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline inline-flex items-center gap-1.5"
          >
            <FaGithub className="w-4 h-4" aria-hidden="true" />
            Contact &amp; Issues
          </a>

          {onOpenCookieSettings && (
            <button
              onClick={onOpenCookieSettings}
              className="hover:underline inline-flex items-center gap-1.5 transition-colors"
            >
              <Cog6ToothIcon className="w-4 h-4" />
              Cookie Settings
            </button>
          )}

          <a
            href="https://wang.wustl.edu/"
            target="_blank"
            rel="noopener noreferrer"
            className="opacity-70 hover:opacity-100 transition-opacity"
          >
            <img src="./wanglab_logo.png" alt="Wang Lab" className="h-6 w-auto" />
          </a>
        </div>
      </div>
    </footer>
  );
}
