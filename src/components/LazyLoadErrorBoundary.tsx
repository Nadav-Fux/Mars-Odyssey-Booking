import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  retryCount: number;
}

const MAX_RETRIES = 2;

/**
 * Error boundary that catches dynamic import failures (stale Vite HMR modules)
 * and auto-recovers by retrying the render or reloading the page.
 */
export default class LazyLoadErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, retryCount: 0 };

  static getDerivedStateFromError(): Partial<State> {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    const isChunkError =
    error.message.includes('dynamically imported module') ||
    error.message.includes('Failed to fetch') ||
    error.message.includes('Loading chunk') ||
    error.message.includes('Loading CSS chunk') ||
    error.name === 'ChunkLoadError';

    if (isChunkError && this.state.retryCount < MAX_RETRIES) {
      // Auto-retry: reset the boundary so React re-renders & retries the import
      this.setState((prev) => ({
        hasError: false,
        retryCount: prev.retryCount + 1
      }));
    } else if (isChunkError) {
      // Exhausted retries → hard reload to get fresh modules
      window.location.reload();
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#050508] text-white">
          <div className="text-center space-y-4 p-8">
            <div className="text-4xl">🛰️</div>
            <h2 className="text-xl font-semibold tracking-wide">Signal Interrupted</h2>
            <p className="text-white/50 text-sm max-w-xs mx-auto">
              Lost connection to mission module. Attempting reconnection…
            </p>
            <button
            onClick={() => window.location.reload()}
            className="mt-4 px-6 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-sm font-medium transition-colors">

              Reload Mission Control
            </button>
          </div>
        </div>);

    }
    return this.props.children;
  }
}