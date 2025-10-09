import React, { useState, useEffect, useRef } from 'react';
import BulkVenueProcessor from '../lib/parsing/BulkVenueProcessor.js';
import AdminInteractionTracker from '../lib/monitoring/AdminInteractionTracker.js';
import './BulkVenueManager.css';

const BulkVenueManager = () => {
  const [bulkProcessor] = useState(() => new BulkVenueProcessor());
  const [tracker] = useState(() => new AdminInteractionTracker());
  const [urls, setUrls] = useState([]);
  const [urlInput, setUrlInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(null);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('import');
  const [importMethod, setImportMethod] = useState('text');
  const fileInputRef = useRef(null);

  // Progress tracking
  useEffect(() => {
    const progressCallback = (progressData) => {
      setProgress(progressData);
    };

    bulkProcessor.onProgress(progressCallback);
    
    return () => {
      bulkProcessor.removeProgressCallback(progressCallback);
    };
  }, [bulkProcessor]);

  const handleUrlInput = (e) => {
    setUrlInput(e.target.value);
  };

  const handleAddUrls = () => {
    if (!urlInput.trim()) return;

    const { validUrls, invalidUrls } = bulkProcessor.parseUrlList(urlInput);
    
    if (invalidUrls.length > 0) {
      setError(`Invalid URLs found: ${invalidUrls.map(u => u.url).join(', ')}`);
      return;
    }

    setUrls(prev => [...prev, ...validUrls]);
    setUrlInput('');
    setError(null);

    // Track URL addition
    tracker.trackInteraction('bulk_urls_added', 'BulkVenueManager', {
      urlCount: validUrls.length,
      timestamp: Date.now()
    });
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target.result;
      const { validUrls, invalidUrls } = bulkProcessor.parseUrlList(content);
      
      if (invalidUrls.length > 0) {
        setError(`Invalid URLs found in file: ${invalidUrls.map(u => u.url).join(', ')}`);
        return;
      }

      setUrls(prev => [...prev, ...validUrls]);
      setError(null);

      // Track file upload
      tracker.trackInteraction('bulk_file_uploaded', 'BulkVenueManager', {
        fileName: file.name,
        fileSize: file.size,
        urlCount: validUrls.length,
        timestamp: Date.now()
      });
    };

    reader.readAsText(file);
  };

  const handleRemoveUrl = (index) => {
    setUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleClearUrls = () => {
    setUrls([]);
    setError(null);
  };

  const handleStartProcessing = async () => {
    if (urls.length === 0) {
      setError('No URLs to process');
      return;
    }

    setIsProcessing(true);
    setProgress(null);
    setResults(null);
    setError(null);

    try {
      // Track processing start
      tracker.trackInteraction('bulk_processing_start', 'BulkVenueManager', {
        urlCount: urls.length,
        timestamp: Date.now()
      });

      const report = await bulkProcessor.processVenueBatch(urls, {
        batchSize: 20,
        delay: 2000,
        maxConcurrent: 5
      });

      setResults(report);

      // Track processing completion
      tracker.trackInteraction('bulk_processing_complete', 'BulkVenueManager', {
        totalProcessed: report.summary.totalProcessed,
        successful: report.summary.successful,
        failed: report.summary.failed,
        totalEvents: report.summary.totalEvents,
        timestamp: Date.now()
      });

    } catch (error) {
      setError(error.message);
      
      // Track processing error
      tracker.trackInteraction('bulk_processing_error', 'BulkVenueManager', {
        error: error.message,
        timestamp: Date.now()
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStopProcessing = () => {
    bulkProcessor.stopProcessing();
    setIsProcessing(false);
  };

  const handleExportResults = (format) => {
    if (!results) return;

    try {
      const exportData = bulkProcessor.exportResults(format);
      const blob = new Blob([exportData], { 
        type: format === 'json' ? 'application/json' : 'text/csv' 
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `venue-processing-results.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      setError(`Export failed: ${error.message}`);
    }
  };

  const formatTime = (ms) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  return (
    <div className="bulk-venue-manager">
      <div className="bulk-header">
        <h2>Bulk Venue Processing</h2>
        <p>Process 1000+ venue URLs with intelligent parsing and progress tracking</p>
      </div>

      <div className="bulk-tabs">
        <button 
          className={activeTab === 'import' ? 'active' : ''}
          onClick={() => setActiveTab('import')}
        >
          Import URLs
        </button>
        <button 
          className={activeTab === 'process' ? 'active' : ''}
          onClick={() => setActiveTab('process')}
        >
          Process ({urls.length})
        </button>
        <button 
          className={activeTab === 'results' ? 'active' : ''}
          onClick={() => setActiveTab('results')}
          disabled={!results}
        >
          Results
        </button>
      </div>

      {activeTab === 'import' && (
        <div className="import-section">
          <div className="import-methods">
            <label>
              <input
                type="radio"
                value="text"
                checked={importMethod === 'text'}
                onChange={(e) => setImportMethod(e.target.value)}
              />
              Text Input
            </label>
            <label>
              <input
                type="radio"
                value="file"
                checked={importMethod === 'file'}
                onChange={(e) => setImportMethod(e.target.value)}
              />
              File Upload
            </label>
          </div>

          {importMethod === 'text' && (
            <div className="text-input-section">
              <textarea
                value={urlInput}
                onChange={handleUrlInput}
                placeholder="Enter URLs (one per line or comma-separated):&#10;https://example1.com&#10;https://example2.com&#10;https://example3.com"
                rows={10}
                className="url-textarea"
              />
              <button onClick={handleAddUrls} className="add-urls-btn">
                Add URLs ({urlInput.split('\n').filter(line => line.trim()).length})
              </button>
            </div>
          )}

          {importMethod === 'file' && (
            <div className="file-upload-section">
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt,.csv"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="file-upload-btn"
              >
                Choose File (.txt or .csv)
              </button>
              <p className="file-help">
                Upload a text file with one URL per line, or a CSV file with URLs in the first column.
              </p>
            </div>
          )}

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
        </div>
      )}

      {activeTab === 'process' && (
        <div className="process-section">
          <div className="url-list">
            <div className="url-list-header">
              <h3>URLs to Process ({urls.length})</h3>
              <button onClick={handleClearUrls} className="clear-btn">
                Clear All
              </button>
            </div>
            
            <div className="url-items">
              {urls.map((url, index) => (
                <div key={index} className="url-item">
                  <span className="url-text">{url}</span>
                  <button 
                    onClick={() => handleRemoveUrl(index)}
                    className="remove-url-btn"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="processing-controls">
            {!isProcessing ? (
              <button 
                onClick={handleStartProcessing}
                className="start-processing-btn"
                disabled={urls.length === 0}
              >
                Start Processing ({urls.length} URLs)
              </button>
            ) : (
              <button 
                onClick={handleStopProcessing}
                className="stop-processing-btn"
              >
                Stop Processing
              </button>
            )}
          </div>

          {progress && (
            <div className="progress-section">
              <div className="progress-header">
                <h3>Processing Progress</h3>
                <span>{progress.percentage}%</span>
              </div>
              
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ width: `${progress.percentage}%` }}
                />
              </div>

              <div className="progress-stats">
                <div className="stat">
                  <span className="stat-label">Processed:</span>
                  <span className="stat-value">{progress.processed}/{progress.total}</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Successful:</span>
                  <span className="stat-value success">{progress.successful}</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Failed:</span>
                  <span className="stat-value error">{progress.failed}</span>
                </div>
                <div className="stat">
                  <span className="stat-label">Events Found:</span>
                  <span className="stat-value">{progress.totalEvents}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'results' && results && (
        <div className="results-section">
          <div className="results-header">
            <h3>Processing Results</h3>
            <div className="export-buttons">
              <button 
                onClick={() => handleExportResults('json')}
                className="export-btn"
              >
                Export JSON
              </button>
              <button 
                onClick={() => handleExportResults('csv')}
                className="export-btn"
              >
                Export CSV
              </button>
            </div>
          </div>

          <div className="results-summary">
            <div className="summary-card">
              <h4>Summary</h4>
              <div className="summary-stats">
                <div className="summary-stat">
                  <span className="stat-label">Total Processed:</span>
                  <span className="stat-value">{results.summary.totalProcessed}</span>
                </div>
                <div className="summary-stat">
                  <span className="stat-label">Success Rate:</span>
                  <span className="stat-value">{results.summary.successRate}%</span>
                </div>
                <div className="summary-stat">
                  <span className="stat-label">Total Events:</span>
                  <span className="stat-value">{results.summary.totalEvents}</span>
                </div>
                <div className="summary-stat">
                  <span className="stat-label">Processing Time:</span>
                  <span className="stat-value">{formatTime(results.summary.processingTime)}</span>
                </div>
                <div className="summary-stat">
                  <span className="stat-label">Avg Confidence:</span>
                  <span className="stat-value">{results.summary.averageConfidence}</span>
                </div>
              </div>
            </div>

            <div className="summary-card">
              <h4>Parser Usage</h4>
              <div className="parser-stats">
                {Object.entries(results.parserUsage).map(([parser, count]) => (
                  <div key={parser} className="parser-stat">
                    <span className="parser-name">{parser}</span>
                    <span className="parser-count">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="summary-card">
              <h4>Venue Types</h4>
              <div className="venue-type-stats">
                {Object.entries(results.venueTypes).map(([type, count]) => (
                  <div key={type} className="venue-type-stat">
                    <span className="venue-type-name">{type}</span>
                    <span className="venue-type-count">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {results.recommendations.length > 0 && (
            <div className="recommendations">
              <h4>Recommendations</h4>
              {results.recommendations.map((rec, index) => (
                <div key={index} className={`recommendation ${rec.priority}`}>
                  <span className="recommendation-type">{rec.type}</span>
                  <span className="recommendation-message">{rec.message}</span>
                </div>
              ))}
            </div>
          )}

          <div className="detailed-results">
            <h4>Detailed Results</h4>
            <div className="results-table">
              <table>
                <thead>
                  <tr>
                    <th>URL</th>
                    <th>Status</th>
                    <th>Events</th>
                    <th>Confidence</th>
                    <th>Method</th>
                    <th>Error</th>
                  </tr>
                </thead>
                <tbody>
                  {results.results.map(({ url, result, success }, index) => (
                    <tr key={index} className={success ? 'success' : 'error'}>
                      <td className="url-cell">{url}</td>
                      <td className="status-cell">
                        {success ? '✓' : '✗'}
                      </td>
                      <td className="events-cell">
                        {result.events ? result.events.length : 0}
                      </td>
                      <td className="confidence-cell">
                        {result.confidence ? Math.round(result.confidence * 100) : 0}%
                      </td>
                      <td className="method-cell">
                        {result.method || 'unknown'}
                      </td>
                      <td className="error-cell">
                        {result.error || ''}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BulkVenueManager;
