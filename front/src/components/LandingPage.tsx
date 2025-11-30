import { useState } from 'react';
import { getGenomeData, getDataStatistics } from '../utils/genomeDataService';
import { setCookie } from '../utils/cookieUtils';

interface LandingPageProps {
  onEnter: () => void;
}

export default function LandingPage({ onEnter }: LandingPageProps) {
  const genomeData = getGenomeData();
  const [skipLandingPage, setSkipLandingPage] = useState(false);
  
  const handleEnter = () => {
    if (skipLandingPage) {
      setCookie('hprc_skip_landing', 'true', 365);
    }
    onEnter();
  };
  
  // Calculate statistics from track data
  const stats_data = getDataStatistics();
  const totalGenomes = stats_data.totalSamples;
  const withMethylation = stats_data.withMethylation;
  const withExpression = stats_data.withExpression;
  const withChromatinAccessibility = stats_data.withChromatinAccessibility;
  const withChromatinConformation = stats_data.withChromatinConformation;
  const totalDataSize = stats_data.totalDataSizeGB / 1024; // Convert to TB

  const features = [
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
        </svg>
      ),
      title: "Complete Genome Assemblies",
      description: "Access high-quality haplotype-resolved genome assemblies from diverse populations worldwide.",
      gradient: "from-primary-500 to-cyan-500"
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"></path>
        </svg>
      ),
      title: "Epigenomic Landscapes",
      description: "Explore DNA methylation, chromatin accessibility, chromatin conformation, and gene expression across the pangenome.",
      gradient: "from-primary-500 to-primary-600"
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
        </svg>
      ),
      title: "Interactive Browser",
      description: "Visualize genomic and epigenomic data with an integrated genome browser interface.",
      gradient: "from-green-500 to-teal-500"
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
      ),
      title: "Population Diversity",
      description: "Investigate genetic and epigenetic variation across African, American, Asian, European, and South Asian populations.",
      gradient: "from-amber-500 to-orange-500"
    }
  ];

  const stats = [
    { label: "Genome Assemblies", value: totalGenomes, icon: "🧬" },
    { label: "Methylation Samples", value: withMethylation, icon: "🔬" },
    { label: "Expression Data", value: withExpression, icon: "📊" },
    { label: "Chromatin Accessibility", value: withChromatinAccessibility, icon: "🧪" },
    { label: "Chromatin Conformation", value: withChromatinConformation, icon: "🔗" },
    { label: "Total Data Size", value: `${totalDataSize.toFixed(1)} TB`, icon: "💾" },
    { label: "Global Populations", value: "5", icon: "🌍" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-primary-200/30 to-transparent rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-blue-200/30 to-transparent rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="relative z-10">
        {/* Hero Section */}
        <section className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-7xl mx-auto text-center">
            {/* Logo */}
            <div className="mb-8 animate-fade-in">
              <img 
                src="./logo.png" 
                alt="HPRC Logo" 
                className="h-24 mx-auto drop-shadow-2xl hover:scale-110 transition-transform duration-300"
              />
            </div>

            {/* Main Title */}
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-black mb-6 animate-fade-in-up">
              <span style={{ color: '#3e5b95' }}>
                HPRC
              </span>
              <br />
              <span className="text-gray-800">
                Epigenome Browser
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              Explore the Human Pangenome Reference Consortium's comprehensive collection of 
              <span className="text-primary-700 font-semibold"> genome assemblies</span> and 
              <span className="text-primary-600 font-semibold"> epigenomic data</span> across diverse populations
            </p>

            {/* CTA Button */}
            <div className="flex flex-col gap-4 justify-center items-center mb-16 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleEnter}
                  className="group relative px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white text-lg font-bold rounded-2xl shadow-2xl hover:shadow-primary-500/50 transition-all duration-300 hover:scale-105"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    Enter Portal
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
                    </svg>
                  </span>
                  <div className="absolute inset-0 bg-primary-700 rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                </button>

                <a
                  href="https://humanpangenome.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-8 py-4 bg-white text-primary-600 text-lg font-bold rounded-2xl border-2 border-primary-200 hover:bg-primary-50 transition-all duration-300 shadow-lg"
                >
                  Learn More
                </a>
              </div>
              
              {/* Skip landing page checkbox */}
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={skipLandingPage}
                  onChange={(e) => setSkipLandingPage(e.target.checked)}
                  className="w-5 h-5 rounded border-2 border-gray-300 bg-white text-primary-600 focus:ring-2 focus:ring-primary-500 focus:ring-offset-0 cursor-pointer"
                />
                <span className="text-gray-600 group-hover:text-gray-800 transition-colors text-sm">
                  Skip this page in the future
                </span>
              </label>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-16 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className="bg-white/80 backdrop-blur-md border border-primary-200 rounded-xl p-4 hover:bg-white transition-all duration-300 hover:scale-105 shadow-lg"
                >
                  <div className="text-3xl mb-2">{stat.icon}</div>
                  <div className="text-2xl md:text-3xl font-bold text-gray-800 mb-1">{stat.value}</div>
                  <div className="text-xs text-gray-600 uppercase tracking-wide">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-center text-gray-800 mb-16 animate-fade-in">
              What You Can Explore
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="group bg-white/80 backdrop-blur-md border border-primary-200 rounded-2xl p-8 hover:bg-white transition-all duration-300 hover:scale-105 hover:shadow-2xl animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className={`inline-flex p-4 rounded-xl bg-gradient-to-br ${feature.gradient} text-white mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-3">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer CTA */}
        <section className="px-4 sm:px-6 lg:px-8 py-20 text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6 animate-fade-in">
              Ready to Explore?
            </h2>
            <p className="text-xl text-gray-600 mb-8 animate-fade-in" style={{ animationDelay: '0.1s' }}>
              Access comprehensive genomic and epigenomic data from the world's most diverse pangenome collection
            </p>
            <div className="flex flex-col gap-4 items-center">
              <button
                onClick={handleEnter}
                className="group relative px-12 py-5 bg-primary-600 hover:bg-primary-700 text-white text-xl font-bold rounded-2xl shadow-2xl hover:shadow-primary-500/50 transition-all duration-300 hover:scale-105 animate-fade-in"
                style={{ animationDelay: '0.2s' }}
              >
                <span className="relative z-10 flex items-center gap-3">
                  Get Started
                  <svg className="w-6 h-6 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path>
                  </svg>
                </span>
                <div className="absolute inset-0 bg-primary-700 rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
              </button>
              
              <label className="flex items-center gap-3 cursor-pointer group animate-fade-in" style={{ animationDelay: '0.3s' }}>
                <input
                  type="checkbox"
                  checked={skipLandingPage}
                  onChange={(e) => setSkipLandingPage(e.target.checked)}
                  className="w-5 h-5 rounded border-2 border-gray-300 bg-white text-primary-600 focus:ring-2 focus:ring-primary-500 focus:ring-offset-0 cursor-pointer"
                />
                <span className="text-gray-600 group-hover:text-gray-800 transition-colors text-sm">
                  Skip this page in the future
                </span>
              </label>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-gray-300 py-8 text-center text-gray-500 text-sm">
          <p>© 2025-2026 Human Pangenome Reference Consortium. All rights reserved.</p>
          <p className="mt-2">
            Part of the{" "}
            <a href="https://humanpangenome.org" target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-700 transition-colors font-semibold">
              NHGRI Human Pangenome Project
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}
