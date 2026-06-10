'use client';

import { Component, type ReactNode, type ErrorInfo } from 'react';

export default class ErrorBoundary extends Component<
  { children: ReactNode; fallback?: ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[Dashboard Error]', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="flex min-h-screen items-center justify-center bg-base-950 p-8">
            <div className="card-premium max-w-md p-8 text-center">
              <h2 className="text-h2 mb-2">Algo salió mal</h2>
              <p className="text-body mb-6">Ocurrió un error inesperado. Intenta recargar la página.</p>
              <button
                onClick={() => window.location.reload()}
                className="btn-primary"
              >
                Recargar
              </button>
            </div>
          </div>
        )
      );
    }
    return this.props.children;
  }
}
