import { Component, ErrorInfo, ReactNode } from 'react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  confirmingReset: boolean;
}

/**
 * Everything this app writes to localStorage. The recovery button clears these
 * and nothing else — it used to call `localStorage.clear()`, which also wiped
 * whatever any other tool on the same origin had stored.
 */
const APP_STORAGE_KEYS = ['hprc_sessions', 'hprc_tutorial_completed'];

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      confirmingReset: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  private resetSavedData = () => {
    for (const key of APP_STORAGE_KEYS) {
      localStorage.removeItem(key);
    }
    window.location.reload();
  };

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full">
            <div className="text-center mb-6">
              <ExclamationTriangleIcon className="w-20 h-20 mx-auto mb-4 text-red-600" />
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Something went wrong
              </h1>
              <p className="text-gray-600 mb-4">
                The application encountered an error. Please try refreshing the page.
              </p>
            </div>

            {this.state.error && (
              <div className="bg-red-50 border-l-4 border-red-600 p-4 rounded mb-4">
                <h3 className="text-sm font-bold text-red-900 mb-2">Error Details:</h3>
                <p className="text-sm text-red-800 font-mono">
                  {this.state.error.toString()}
                </p>
              </div>
            )}

            {this.state.errorInfo && (
              <details className="bg-gray-50 border border-gray-200 rounded p-4 mb-4">
                <summary className="text-sm font-semibold text-gray-700 cursor-pointer hover:text-gray-900">
                  Stack Trace (click to expand)
                </summary>
                <pre className="mt-2 text-xs text-gray-600 overflow-x-auto">
                  {this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}

            {/* Resetting throws away the user's saved sessions, so it says so
                and asks twice. The old single click did it silently. */}
            {this.state.confirmingReset && (
              <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded mb-4">
                <p className="text-sm text-amber-900">
                  This deletes every saved session in this browser and cannot be undone. Try{' '}
                  <strong>Refresh page</strong> first — most errors clear on their own.
                </p>
              </div>
            )}

            <div className="flex flex-wrap gap-3 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl shadow-sm hover:shadow-lg transition-all duration-300"
              >
                Refresh page
              </button>
              {this.state.confirmingReset ? (
                <>
                  <button
                    onClick={() => this.setState({ confirmingReset: false })}
                    className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-xl transition-all duration-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={this.resetSavedData}
                    className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-all duration-300"
                  >
                    Yes, delete saved data
                  </button>
                </>
              ) : (
                <button
                  onClick={() => this.setState({ confirmingReset: true })}
                  className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-xl transition-all duration-300"
                >
                  Reset saved data &amp; refresh
                </button>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

