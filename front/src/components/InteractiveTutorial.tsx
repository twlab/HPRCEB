import { useState, useEffect, useRef } from 'react';

interface TutorialStep {
  title: string;
  description: string;
  targetSelector: string;
  position: 'top' | 'bottom' | 'left' | 'right';
  highlightPadding?: number;
  action?: () => void;
}

interface InteractiveTutorialProps {
  nightMode: boolean;
  onComplete: () => void;
  onSkip: () => void;
  onTabChange?: (tab: string) => void;
}

export default function InteractiveTutorial({ 
  nightMode, 
  onComplete, 
  onSkip,
  onTabChange 
}: InteractiveTutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [loadingFailed, setLoadingFailed] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const steps: TutorialStep[] = [
    {
      title: "Welcome to WashU Epigenome Browser! 🎉",
      description: "Let's take a quick tour to help you get started. This will only take a minute!",
      targetSelector: "header",
      position: "bottom",
      highlightPadding: 10,
    },
    {
      title: "Navigation Tabs",
      description: "Use these tabs to navigate between different sections. The workflow is: Sample → Track → Browser.",
      targetSelector: "nav",
      position: "bottom",
      highlightPadding: 10,
    },
    {
      title: "Night Mode Toggle 🌙",
      description: "Toggle between light and dark modes for comfortable viewing at any time of day.",
      targetSelector: "header button[aria-label='Toggle night mode']",
      position: "left",
      highlightPadding: 15,
    },
    {
      title: "Step 1: Sample Tab",
      description: "Start here! Select genomes and configure data layers (methylation, expression, chromatin accessibility, chromatin conformation).",
      targetSelector: "nav button:nth-child(1)",
      position: "bottom",
      highlightPadding: 10,
      action: () => onTabChange?.('sample'),
    },
    {
      title: "Step 2: Track Tab 🎯",
      description: "Configure which tracks to display. Enable/disable specific tracks before visualization.",
      targetSelector: "nav button:nth-child(2)",
      position: "bottom",
      highlightPadding: 10,
    },
    {
      title: "Step 3: Browser Tab 🧬",
      description: "Visualize your selected tracks in the WashU Epigenome Browser with interactive genomic data.",
      targetSelector: "nav button:nth-child(3)",
      position: "bottom",
      highlightPadding: 10,
    },
    {
      title: "Sessions Tab 💾",
      description: "Save your complete configuration (genomes, data layers, and track selections) for later use!",
      targetSelector: "nav button:nth-child(4)",
      position: "bottom",
      highlightPadding: 10,
    },
    {
      title: "Tutorials & Help 📚",
      description: "Need help? Visit the Tutorials tab for detailed guides and documentation.",
      targetSelector: "nav button:nth-child(6)",
      position: "bottom",
      highlightPadding: 10,
    },
    {
      title: "You're All Set! ✨",
      description: "You now know the basics! Start by selecting genomes in the Sample tab, configure tracks in the Track tab, then visualize in the Browser. You can restart this tutorial anytime from the Tutorials tab.",
      targetSelector: "main",
      position: "top",
      highlightPadding: 20,
    },
  ];

  const currentStepData = steps[currentStep];

  useEffect(() => {
    setLoadingFailed(false);
    setTargetRect(null);
    let found = false;

    const updateTargetPosition = () => {
      try {
        const target = document.querySelector(currentStepData.targetSelector);
        if (target) {
          const rect = target.getBoundingClientRect();
          setTargetRect(rect);
          found = true;
        }
      } catch (error) {
        console.error('Error updating target position:', error);
      }
    };

    // Initial position update with a small delay to ensure DOM is ready
    const timer = setTimeout(updateTargetPosition, 100);
    
    // Fallback: if target not found after 3 seconds, show error
    const failureTimer = setTimeout(() => {
      if (!found) {
        console.warn('Tutorial: Could not find target element:', currentStepData.targetSelector);
        setLoadingFailed(true);
      }
    }, 3000);
    
    window.addEventListener('resize', updateTargetPosition);
    window.addEventListener('scroll', updateTargetPosition);

    return () => {
      clearTimeout(timer);
      clearTimeout(failureTimer);
      window.removeEventListener('resize', updateTargetPosition);
      window.removeEventListener('scroll', updateTargetPosition);
    };
  }, [currentStep, currentStepData.targetSelector]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setIsAnimating(true);
      if (currentStepData.action) {
        currentStepData.action();
      }
      setTimeout(() => {
        setCurrentStep(currentStep + 1);
        setIsAnimating(false);
      }, 300);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(currentStep - 1);
        setIsAnimating(false);
      }, 300);
    }
  };

  const handleComplete = () => {
    setIsAnimating(true);
    setTimeout(() => {
      onComplete();
    }, 300);
  };

  const handleSkip = () => {
    setIsAnimating(true);
    setTimeout(() => {
      onSkip();
    }, 300);
  };

  if (!targetRect && !loadingFailed) {
    // Loading state while waiting for target element
    return (
      <div className="fixed inset-0 bg-black bg-opacity-85 z-[9999] flex items-center justify-center">
        <div className={`${nightMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-6 max-w-md shadow-2xl`}>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className={`mt-4 text-center ${nightMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Loading tutorial...
          </p>
        </div>
      </div>
    );
  }

  if (loadingFailed) {
    // Show error state with option to skip
    return (
      <div className="fixed inset-0 bg-black bg-opacity-85 z-[9999] flex items-center justify-center">
        <div className={`${nightMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl p-6 max-w-md shadow-2xl`}>
          <div className="text-center">
            <svg className="w-16 h-16 mx-auto mb-4 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
            </svg>
            <h3 className={`text-lg font-bold mb-2 ${nightMode ? 'text-gray-100' : 'text-gray-900'}`}>
              Tutorial Not Available
            </h3>
            <p className={`text-sm mb-4 ${nightMode ? 'text-gray-300' : 'text-gray-700'}`}>
              The tutorial couldn't load properly. You can still use the app normally.
            </p>
            <button
              onClick={handleSkip}
              className="px-6 py-3 bg-gradient-to-r from-primary-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300"
            >
              Continue to App
            </button>
          </div>
        </div>
      </div>
    );
  }

  // This should never happen due to the early returns above, but TypeScript needs this
  if (!targetRect) {
    return null;
  }

  const padding = currentStepData.highlightPadding || 10;
  const spotlightStyle = {
    left: `${targetRect.left - padding}px`,
    top: `${targetRect.top - padding}px`,
    width: `${targetRect.width + padding * 2}px`,
    height: `${targetRect.height + padding * 2}px`,
  };

  // Calculate tooltip position
  const getTooltipStyle = () => {
    const tooltipWidth = 400;
    const tooltipHeight = 200;
    const spacing = 20;

    let style: React.CSSProperties = {};

    switch (currentStepData.position) {
      case 'bottom':
        style = {
          left: `${Math.max(20, Math.min(window.innerWidth - tooltipWidth - 20, targetRect.left + targetRect.width / 2 - tooltipWidth / 2))}px`,
          top: `${targetRect.bottom + padding + spacing}px`,
        };
        break;
      case 'top':
        style = {
          left: `${Math.max(20, Math.min(window.innerWidth - tooltipWidth - 20, targetRect.left + targetRect.width / 2 - tooltipWidth / 2))}px`,
          top: `${Math.max(20, targetRect.top - padding - spacing - tooltipHeight)}px`,
        };
        break;
      case 'left':
        style = {
          left: `${Math.max(20, targetRect.left - tooltipWidth - spacing)}px`,
          top: `${Math.max(20, Math.min(window.innerHeight - tooltipHeight - 20, targetRect.top + targetRect.height / 2 - tooltipHeight / 2))}px`,
        };
        break;
      case 'right':
        style = {
          left: `${Math.min(window.innerWidth - tooltipWidth - 20, targetRect.right + spacing)}px`,
          top: `${Math.max(20, Math.min(window.innerHeight - tooltipHeight - 20, targetRect.top + targetRect.height / 2 - tooltipHeight / 2))}px`,
        };
        break;
    }

    return style;
  };

  return (
    <div className={`fixed inset-0 z-[9999] transition-opacity duration-300 ${isAnimating ? 'opacity-0' : 'opacity-100'}`}>
      {/* Dark overlay with cutout for spotlight */}
      <div className="absolute inset-0">
        {/* SVG with mask for spotlight effect */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <defs>
            <mask id="spotlight-mask">
              <rect x="0" y="0" width="100%" height="100%" fill="white" />
              <rect
                x={targetRect.left - padding}
                y={targetRect.top - padding}
                width={targetRect.width + padding * 2}
                height={targetRect.height + padding * 2}
                rx="12"
                fill="black"
              />
            </mask>
          </defs>
          <rect
            x="0"
            y="0"
            width="100%"
            height="100%"
            fill="rgba(0, 0, 0, 0.85)"
            mask="url(#spotlight-mask)"
          />
        </svg>

        {/* Animated spotlight border */}
        <div
          className="absolute transition-all duration-500 ease-out rounded-xl pointer-events-none"
          style={{
            ...spotlightStyle,
            boxShadow: '0 0 0 4px rgba(99, 102, 241, 0.8), 0 0 40px 10px rgba(99, 102, 241, 0.4)',
            animation: 'pulse-border 2s ease-in-out infinite',
          }}
        />
      </div>

      {/* Tutorial tooltip */}
      <div
        ref={tooltipRef}
        className={`absolute ${nightMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'} rounded-2xl shadow-2xl border-2 p-6 transition-all duration-500 ease-out`}
        style={{
          ...getTooltipStyle(),
          maxWidth: '400px',
          minHeight: '200px',
          zIndex: 10001,
        }}
      >
        {/* Progress indicator */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex gap-1.5">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentStep
                    ? 'w-8 bg-gradient-to-r from-primary-500 to-purple-500'
                    : index < currentStep
                    ? 'w-2 bg-green-500'
                    : 'w-2 bg-gray-300'
                }`}
              />
            ))}
          </div>
          <span className={`text-xs font-medium ${nightMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {currentStep + 1} / {steps.length}
          </span>
        </div>

        {/* Content */}
        <div className="mb-6">
          <h3 className={`text-xl font-bold mb-3 ${nightMode ? 'text-gray-100' : 'text-gray-900'}`}>
            {currentStepData.title}
          </h3>
          <p className={`text-sm leading-relaxed ${nightMode ? 'text-gray-300' : 'text-gray-700'}`}>
            {currentStepData.description}
          </p>
        </div>

        {/* Navigation buttons */}
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={handleSkip}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
              nightMode
                ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            Skip Tutorial
          </button>

          <div className="flex gap-2">
            {currentStep > 0 && (
              <button
                onClick={handlePrevious}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                  nightMode
                    ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Previous
              </button>
            )}
            <button
              onClick={handleNext}
              className="px-6 py-2 text-sm font-medium bg-gradient-to-r from-primary-600 to-purple-600 text-white rounded-lg hover:from-primary-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl hover:scale-105"
            >
              {currentStep === steps.length - 1 ? 'Finish' : 'Next'}
            </button>
          </div>
        </div>

        {/* Helpful hint */}
        {currentStep === steps.length - 1 && (
          <div className={`mt-4 pt-4 border-t ${nightMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <p className={`text-xs ${nightMode ? 'text-gray-400' : 'text-gray-500'}`}>
              💡 You can restart this tutorial anytime from the Tutorials tab
            </p>
          </div>
        )}
      </div>

      {/* Pulse border animation */}
      <style>{`
        @keyframes pulse-border {
          0%, 100% {
            box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.8), 0 0 40px 10px rgba(99, 102, 241, 0.4);
          }
          50% {
            box-shadow: 0 0 0 4px rgba(139, 92, 246, 0.8), 0 0 60px 15px rgba(139, 92, 246, 0.6);
          }
        }
      `}</style>
    </div>
  );
}

