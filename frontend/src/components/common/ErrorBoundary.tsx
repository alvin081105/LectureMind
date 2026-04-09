import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#0d0d1a] text-white p-8">
          <div className="max-w-lg w-full">
            <h1 className="text-2xl font-bold text-red-400 mb-4">앱 오류 발생</h1>
            <pre className="bg-white/10 rounded-xl p-4 text-sm text-red-300 overflow-auto whitespace-pre-wrap break-words">
              {this.state.error.message}
              {'\n\n'}
              {this.state.error.stack}
            </pre>
            <button
              onClick={() => window.location.reload()}
              className="mt-6 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-xl text-sm font-semibold"
            >
              새로고침
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
