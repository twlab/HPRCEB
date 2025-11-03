interface FooterProps {
  nightMode?: boolean;
}

export default function Footer({ nightMode = false }: FooterProps) {
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
            ✨ HPRC Epigenome Navigator | For research use only | 
            <a 
              href="https://humanpangenome.org" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary-600 hover:text-primary-700 font-semibold hover:underline ml-1"
            >
              Learn more about HPRC →
            </a>
          </p>
          
          {/* Contact and Issue Tracker */}
          <p className={`text-center text-xs ${nightMode ? 'text-gray-400' : 'text-gray-500'}`}>
            <a 
              href="https://github.com/twlab/HPRCEN" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:underline inline-flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
              </svg>
              Contact & Issue Tracker
            </a>
          </p>
          
          {/* Wang Lab Logo and Link */}
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 w-full flex justify-center">
            <a 
              href="https://wang.wustl.edu/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 opacity-80 hover:opacity-100 transition-opacity"
            >
              <img 
                src="https://wang.wustl.edu/image/logo/wanglab_logo_2024.png" 
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


