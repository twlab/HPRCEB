interface AboutProps {
  nightMode: boolean;
}

function About({ nightMode }: AboutProps) {
  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Hero Section */}
      <div className={`${nightMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'} rounded-2xl shadow-lg p-8`}>
        <h1 className={`text-4xl font-bold mb-4 ${nightMode ? 'text-gray-100' : 'text-gray-900'}`}>About HPRC Epigenome Browser</h1>
        <p className={`text-xl ${nightMode ? 'text-gray-300' : 'text-gray-600'}`}>
          A modern, interactive web portal that democratizes access to HPRC Release 2 epigenomics data through an intuitive interface supporting genome selection, data visualization, and bulk download capabilities.
        </p>
      </div>

      {/* Contact Section */}
      <div className={`${nightMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-xl p-8`}>
        <div className="space-y-8">
          {/* Developed By */}
          <div>
            <h2 className={`text-2xl font-bold ${nightMode ? 'text-gray-100' : 'text-gray-900'} mb-4`}>
              Developed by
            </h2>
            <div className={`${nightMode ? 'text-gray-300' : 'text-gray-700'} space-y-2`}>
              <a 
                href="https://wang.wustl.edu/"
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center ${nightMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'} text-lg font-medium transition-colors`}
              >
                Wang Lab at Washington University in St. Louis
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                </svg>
              </a>
              <p className={`${nightMode ? 'text-gray-400' : 'text-gray-600'} text-base leading-relaxed`}>
                The HPRC Epigenome Browser is developed and maintained by the Wang Lab in the Department of Genetics 
                at Washington University School of Medicine.
              </p>
            </div>
          </div>

          {/* Contact and Issue Tracker */}
          <div>
            <h2 className={`text-2xl font-bold ${nightMode ? 'text-gray-100' : 'text-gray-900'} mb-4`}>
              Contact and Issue Tracker
            </h2>
            <div className={`${nightMode ? 'text-gray-300' : 'text-gray-700'} space-y-2`}>
              <a 
                href="https://github.com/twlab/HPRCEB"
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center ${nightMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'} text-lg font-medium transition-colors`}
              >
                GitHub: twlab/HPRCEB
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                </svg>
              </a>
              <p className={`${nightMode ? 'text-gray-400' : 'text-gray-600'} text-base leading-relaxed`}>
                For questions, bug reports, or feature requests, please visit our GitHub repository. 
                You can also reach out to the development team for collaboration inquiries or technical support.
              </p>
            </div>
          </div>

          {/* More About HPRC */}
          <div>
            <h2 className={`text-2xl font-bold ${nightMode ? 'text-gray-100' : 'text-gray-900'} mb-4`}>
              More About HPRC
            </h2>
            <div className={`${nightMode ? 'text-gray-300' : 'text-gray-700'} space-y-2`}>
              <a 
                href="https://humanpangenome.org/"
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center ${nightMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'} text-lg font-medium transition-colors`}
              >
                Human Pangenome Reference Consortium
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                </svg>
              </a>
              <p className={`${nightMode ? 'text-gray-400' : 'text-gray-600'} text-base leading-relaxed`}>
                The Human Pangenome Reference Consortium (HPRC) is an NIH-funded project creating a human pangenome 
                reference that represents global human genomic variation. Learn more about the consortium's goals, 
                data releases, and collaborative research efforts.
              </p>
            </div>
          </div>

          {/* AWS Open Data */}
          <div>
            <h2 className={`text-2xl font-bold ${nightMode ? 'text-gray-100' : 'text-gray-900'} mb-4`}>
              AWS Open Data
            </h2>
            <div className={`${nightMode ? 'text-gray-300' : 'text-gray-700'} space-y-2 mb-4`}>
              <a 
                href="https://registry.opendata.aws/hprc-epigenome/"
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center ${nightMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'} text-lg font-medium transition-colors`}
              >
                Registry of Open Data on AWS
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                </svg>
              </a>
              <p className={`${nightMode ? 'text-gray-400' : 'text-gray-600'} text-base leading-relaxed`}>
                Access comprehensive dataset information, documentation, and download instructions through the 
                official AWS Open Data registry page for HPRC epigenomics data.
              </p>
            </div>
            <div className={`${nightMode ? 'bg-gradient-to-r from-orange-900/30 to-yellow-900/30 border-orange-700' : 'bg-gradient-to-r from-orange-50 to-yellow-50 border-orange-300'} p-6 rounded-xl border-2`}>
              <div className="flex items-start">
                <div className="text-4xl mr-4">☁️</div>
                <div>
                  <h3 className={`text-xl font-bold ${nightMode ? 'text-gray-100' : 'text-gray-900'} mb-2`}>
                    Special Thanks to AWS Open Data
                  </h3>
                  <p className={`${nightMode ? 'text-gray-300' : 'text-gray-700'} text-base leading-relaxed`}>
                    This project is made possible through the generous support of the AWS Open Data Sponsorship Program. 
                    AWS provides free cloud storage and computing resources, enabling us to share HPRC epigenomics data 
                    openly with the research community worldwide.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default About;








