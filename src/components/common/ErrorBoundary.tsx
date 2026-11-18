import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      errorMessage: error.message || 'Unexpected application error',
    };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('ErrorBoundary caught error:', error, info);
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    let parsedDetails: { error?: string; operationType?: string; path?: string } | null = null;
    try {
      parsedDetails = JSON.parse(this.state.errorMessage);
    } catch {
      parsedDetails = null;
    }

    return (
      <div className="min-h-screen bg-[#0c0c14] text-white flex items-center justify-center p-6">
        <div className="max-w-lg w-full rounded-2xl bg-[#141420] border border-red-500/40 p-6 space-y-4">
          <h1 className="text-xl font-bold text-red-400">Something interrupted your coaching session</h1>
          <p className="text-sm text-gray-300 leading-relaxed">
            {parsedDetails?.error
              ? `Database ${parsedDetails.operationType || 'operation'} error on ${parsedDetails.path || 'workspace'}: ${parsedDetails.error}`
              : this.state.errorMessage}
          </p>
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={() => {
                this.setState({ hasError: false, errorMessage: '' });
                window.location.reload();
              }}
              className="px-4 py-2 rounded-xl bg-amber-400 text-[#0c0c14] font-bold text-sm hover:brightness-110 transition-all"
            >
              Reload Workspace
            </button>
            <a
              href="/"
              className="px-4 py-2 rounded-xl border border-white/15 text-gray-300 text-sm hover:text-white transition-colors"
            >
              Return Home
            </a>
          </div>
        </div>
      </div>
    );
  }
}
