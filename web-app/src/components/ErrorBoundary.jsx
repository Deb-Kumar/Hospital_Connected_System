import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Uncaught Application Error:', error, errorInfo);
  }

  handleReset = () => {
    localStorage.clear();
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 text-center font-inter">
          <div className="bg-slate-800 border border-slate-700 p-8 rounded-3xl max-w-md w-full space-y-4 shadow-2xl">
            <span className="text-5xl block">🏥</span>
            <h2 className="text-xl font-bold text-white">Brainware Hospital Connected System</h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              A temporary interface state error was detected. Restoring session state and reloading will return you to the home portal.
            </p>
            <div className="pt-2 flex flex-col gap-2">
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-primary hover:bg-primaryDark text-white text-xs font-bold py-3 rounded-xl transition shadow"
              >
                Reload Application
              </button>
              <button
                onClick={this.handleReset}
                className="w-full bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-semibold py-2.5 rounded-xl transition"
              >
                Clear Cache & Reset Session
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
