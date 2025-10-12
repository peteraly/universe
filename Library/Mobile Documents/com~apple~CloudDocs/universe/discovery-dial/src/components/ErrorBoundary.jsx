import React, { Component, useState, useEffect } from 'react';
import { motion } from 'framer-motion';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // Report error to monitoring service (future implementation)
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      // Fallback UI
      return (
        <motion.div
          className="error-boundary"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="error-content">
            <h2>Something went wrong</h2>
            <p>We're sorry, but something unexpected happened.</p>
            
            {this.props.fallback ? (
              this.props.fallback
            ) : (
              <div className="error-actions">
                <button
                  onClick={() => window.location.reload()}
                  className="retry-button"
                >
                  Reload Page
                </button>
                <button
                  onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })}
                  className="retry-button"
                >
                  Try Again
                </button>
              </div>
            )}
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="error-details">
                <summary>Error Details (Development)</summary>
                <pre>{this.state.error.toString()}</pre>
                <pre>{this.state.errorInfo.componentStack}</pre>
              </details>
            )}
          </div>
        </motion.div>
      );
    }

    return this.props.children;
  }
}

// Functional error boundary for hooks
export const FunctionalErrorBoundary = ({ children, fallback, onError }) => {
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleError = (errorEvent) => {
      console.error('FunctionalErrorBoundary caught an error:', errorEvent.error);
      setHasError(true);
      setError(errorEvent.error);
      
      if (onError) {
        onError(errorEvent.error, errorEvent);
      }
    };

    const handleUnhandledRejection = (event) => {
      console.error('Unhandled promise rejection:', event.reason);
      setHasError(true);
      setError(event.reason);
      
      if (onError) {
        onError(event.reason, event);
      }
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [onError]);

  if (hasError) {
    return (
      <motion.div
        className="error-boundary"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="error-content">
          <h2>Something went wrong</h2>
          <p>We're sorry, but something unexpected happened.</p>
          
          {fallback ? (
            fallback
          ) : (
            <div className="error-actions">
              <button
                onClick={() => window.location.reload()}
                className="retry-button"
              >
                Reload Page
              </button>
              <button
                onClick={() => setHasError(false)}
                className="retry-button"
              >
                Try Again
              </button>
            </div>
          )}
          
          {process.env.NODE_ENV === 'development' && error && (
            <details className="error-details">
              <summary>Error Details (Development)</summary>
              <pre>{error.toString()}</pre>
            </details>
          )}
        </div>
      </motion.div>
    );
  }

  return children;
};

export default ErrorBoundary;
