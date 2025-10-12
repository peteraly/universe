import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Debug: Log that main.jsx is loading
console.log('🔵 main.jsx loading...');

// Catch any top-level errors
window.addEventListener('error', (e) => {
  console.error('🔴 Global error:', e.error);
});

window.addEventListener('unhandledrejection', (e) => {
  console.error('🔴 Unhandled promise rejection:', e.reason);
});

// Simple error boundary
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          background: 'black',
          color: 'white',
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          fontFamily: 'monospace'
        }}>
          <h1 style={{ color: '#FF3B30', marginBottom: '20px' }}>Error Loading App</h1>
          <pre style={{ 
            background: '#222', 
            padding: '20px', 
            borderRadius: '8px',
            maxWidth: '80%',
            overflow: 'auto'
          }}>
            {this.state.error?.toString()}
            {'\n\n'}
            {this.state.error?.stack}
          </pre>
          <button 
            onClick={() => window.location.reload()} 
            style={{
              marginTop: '20px',
              padding: '10px 20px',
              background: '#FF3B30',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Debug: Confirm we're about to render
console.log('🔵 Attempting to render React app...');

const rootElement = document.getElementById('root');
console.log('🔵 Root element:', rootElement);

if (!rootElement) {
  console.error('🔴 CRITICAL: Root element not found!');
  document.body.innerHTML = '<div style="background:black;color:white;padding:20px;font-family:monospace;">🔴 ERROR: Root element not found. Check index.html</div>';
} else {
  try {
    const root = ReactDOM.createRoot(rootElement);
    console.log('🔵 React root created');
    
    root.render(
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    );
    
    console.log('✅ React render called successfully');
  } catch (error) {
    console.error('🔴 CRITICAL ERROR during render:', error);
    document.body.innerHTML = `
      <div style="background:black;color:white;padding:20px;font-family:monospace;">
        <h1 style="color:#FF3B30">🔴 React Render Failed</h1>
        <pre>${error.toString()}\n\n${error.stack}</pre>
      </div>
    `;
  }
}
