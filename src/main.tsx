import React, { StrictMode, Component, ErrorInfo, ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class GlobalErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  declare props: ErrorBoundaryProps;
  state: ErrorBoundaryState = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in application:', error, errorInfo);
  }

  handleReset = () => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6 font-sans">
          <div className="bg-white max-w-lg w-full rounded-3xl p-8 shadow-xl border border-red-200 text-center space-y-4">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
              ⚠️
            </div>
            <h2 className="text-xl font-black text-slate-800">
              系統載入時遇到小問題
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              很可能是瀏覽器暫存的舊版設定與最新功能產生衝突。請點擊下方按鈕重新載入或重設暫存：
            </p>
            {this.state.error && (
              <div className="bg-red-50 text-red-800 p-3 rounded-xl text-left text-xs font-mono break-all max-h-36 overflow-y-auto border border-red-100">
                {this.state.error.toString()}
              </div>
            )}
            <div className="flex gap-3 justify-center pt-2">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition cursor-pointer"
              >
                🔄 重新整理
              </button>
              <button
                type="button"
                onClick={this.handleReset}
                className="bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition cursor-pointer"
              >
                🧹 清除快取並重整
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

console.log("==> main.tsx has begun execution");

try {
  console.log("==> Initializing createRoot on #root...");
  const rootElement = document.getElementById('root');
  if (rootElement) {
    const root = createRoot(rootElement);
    root.render(
      <StrictMode>
        <GlobalErrorBoundary>
          <App />
        </GlobalErrorBoundary>
      </StrictMode>
    );
    console.log("==> createRoot.render dispatched successfully");
  } else {
    console.error("==> #root element not found!");
  }
} catch (err: any) {
  console.error("==> Fatal error inside main.tsx render:", err);
  const errDiv = document.getElementById('debug-error');
  if (errDiv) {
    errDiv.style.display = 'block';
    errDiv.innerText = 'Render Error:\n' + (err?.stack || err?.message || String(err));
  }
}

// Manage Service Worker
if ('serviceWorker' in navigator) {
  if (import.meta.env.DEV) {
    // In dev mode, unregister any existing service worker and purge caches to avoid serving stale index.html
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (const registration of registrations) {
        registration.unregister();
      }
    });
    if ('caches' in window) {
      caches.keys().then((names) => {
        for (const name of names) {
          caches.delete(name);
        }
      });
    }
  } else {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/firebase-messaging-sw.js')
        .then((reg) => {
          console.log('Unified Service Worker registered with scope: ', reg.scope);
        })
        .catch((err) => {
          console.warn('Service Worker registration failed: ', err);
        });
    });
  }
}
