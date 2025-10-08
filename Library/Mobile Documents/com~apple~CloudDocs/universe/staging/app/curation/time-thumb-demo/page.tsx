#Context: Time Thumb Demo Page Skeleton
// Demo page for TimeIndexThumbPicker component
// Part of V12.0 L1 Event Curation Hub implementation

import React, { useState } from 'react';
import { TimeIndexThumbPicker } from '../../../components/TimeIndexThumbPicker';
import { formatTimeDisplay, TIME_PRESETS } from '../../../lib/time/format';

export default function TimeThumbDemoPage() {
  // TODO: Implement demo state management
  const [selectedTime, setSelectedTime] = useState('12:00');
  const [minTime, setMinTime] = useState('09:00');
  const [maxTime, setMaxTime] = useState('17:00');
  const [step, setStep] = useState(15);
  const [disabled, setDisabled] = useState(false);
  const [format, setFormat] = useState<'12h' | '24h'>('24h');

  // TODO: Implement demo event handlers
  const handleTimeChange = (newTime: string) => {
    setSelectedTime(newTime);
    console.log('Time changed to:', newTime);
  };

  const handlePresetChange = (preset: keyof typeof TIME_PRESETS) => {
    const presetRange = TIME_PRESETS[preset];
    setMinTime(presetRange.start);
    setMaxTime(presetRange.end);
  };

  const handleStepChange = (newStep: number) => {
    setStep(newStep);
  };

  const toggleDisabled = () => {
    setDisabled(!disabled);
  };

  const toggleFormat = () => {
    setFormat(format === '24h' ? '12h' : '24h');
  };

  return (
    <div className="time-thumb-demo">
      {/* TODO: Implement demo header */}
      <header className="demo-header">
        <h1>Time Index Thumb Picker Demo</h1>
        <p>Interactive demonstration of the TimeIndexThumbPicker component</p>
      </header>

      {/* TODO: Implement demo controls */}
      <section className="demo-controls">
        <h2>Controls</h2>
        
        {/* TODO: Implement time range presets */}
        <div className="control-group">
          <label>Time Range Presets:</label>
          <div className="preset-buttons">
            {Object.keys(TIME_PRESETS).map((preset) => (
              <button
                key={preset}
                onClick={() => handlePresetChange(preset as keyof typeof TIME_PRESETS)}
                className="preset-button"
              >
                {preset.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* TODO: Implement step control */}
        <div className="control-group">
          <label>Step (minutes):</label>
          <select 
            value={step} 
            onChange={(e) => handleStepChange(Number(e.target.value))}
          >
            <option value={5}>5 minutes</option>
            <option value={10}>10 minutes</option>
            <option value={15}>15 minutes</option>
            <option value={30}>30 minutes</option>
            <option value={60}>60 minutes</option>
          </select>
        </div>

        {/* TODO: Implement format toggle */}
        <div className="control-group">
          <label>Time Format:</label>
          <button onClick={toggleFormat} className="format-button">
            {format === '24h' ? 'Switch to 12h' : 'Switch to 24h'}
          </button>
        </div>

        {/* TODO: Implement disabled toggle */}
        <div className="control-group">
          <label>Disabled State:</label>
          <button onClick={toggleDisabled} className="disabled-button">
            {disabled ? 'Enable' : 'Disable'}
          </button>
        </div>
      </section>

      {/* TODO: Implement demo picker */}
      <section className="demo-picker">
        <h2>Time Picker</h2>
        <div className="picker-container">
          <TimeIndexThumbPicker
            value={selectedTime}
            onChange={handleTimeChange}
            minTime={minTime}
            maxTime={maxTime}
            step={step}
            disabled={disabled}
            className="demo-picker-component"
          />
        </div>
      </section>

      {/* TODO: Implement demo output */}
      <section className="demo-output">
        <h2>Output</h2>
        <div className="output-display">
          <div className="output-item">
            <label>Selected Time (24h):</label>
            <span className="time-value">{selectedTime}</span>
          </div>
          <div className="output-item">
            <label>Selected Time (12h):</label>
            <span className="time-value">{formatTimeDisplay(selectedTime, '12h')}</span>
          </div>
          <div className="output-item">
            <label>Time Range:</label>
            <span className="range-value">{minTime} - {maxTime}</span>
          </div>
          <div className="output-item">
            <label>Step:</label>
            <span className="step-value">{step} minutes</span>
          </div>
          <div className="output-item">
            <label>Disabled:</label>
            <span className="disabled-value">{disabled ? 'Yes' : 'No'}</span>
          </div>
        </div>
      </section>

      {/* TODO: Implement demo features */}
      <section className="demo-features">
        <h2>Features</h2>
        <ul className="features-list">
          <li>✅ Mouse drag interaction</li>
          <li>✅ Touch drag interaction</li>
          <li>✅ Keyboard navigation</li>
          <li>✅ Accessibility support</li>
          <li>✅ Customizable time range</li>
          <li>✅ Configurable step size</li>
          <li>✅ 12h/24h format support</li>
          <li>✅ Disabled state</li>
          <li>✅ Responsive design</li>
          <li>✅ Dark theme support</li>
        </ul>
      </section>

      {/* TODO: Implement demo instructions */}
      <section className="demo-instructions">
        <h2>How to Use</h2>
        <ol className="instructions-list">
          <li>Drag the blue thumb to select a time</li>
          <li>Use arrow keys for keyboard navigation</li>
          <li>Try different time range presets</li>
          <li>Adjust the step size for different precision</li>
          <li>Toggle between 12h and 24h format</li>
          <li>Test the disabled state</li>
        </ol>
      </section>

      {/* TODO: Implement demo styles */}
      <style jsx>{`
        .time-thumb-demo {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .demo-header {
          text-align: center;
          margin-bottom: 30px;
        }

        .demo-header h1 {
          color: #333;
          margin-bottom: 10px;
        }

        .demo-header p {
          color: #666;
          font-size: 16px;
        }

        .demo-controls {
          background: #f8f9fa;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 30px;
        }

        .control-group {
          margin-bottom: 15px;
        }

        .control-group label {
          display: block;
          margin-bottom: 5px;
          font-weight: 600;
        }

        .preset-buttons {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .preset-button, .format-button, .disabled-button {
          padding: 8px 16px;
          border: 1px solid #ddd;
          border-radius: 4px;
          background: #fff;
          cursor: pointer;
          transition: all 0.2s;
        }

        .preset-button:hover, .format-button:hover, .disabled-button:hover {
          background: #f0f0f0;
        }

        .demo-picker {
          text-align: center;
          margin-bottom: 30px;
        }

        .picker-container {
          display: inline-block;
          width: 100%;
          max-width: 400px;
        }

        .demo-output {
          background: #f8f9fa;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 30px;
        }

        .output-display {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 15px;
        }

        .output-item {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .output-item label {
          font-weight: 600;
          color: #666;
        }

        .time-value, .range-value, .step-value, .disabled-value {
          font-family: monospace;
          background: #fff;
          padding: 8px 12px;
          border-radius: 4px;
          border: 1px solid #ddd;
        }

        .demo-features, .demo-instructions {
          margin-bottom: 30px;
        }

        .features-list, .instructions-list {
          padding-left: 20px;
        }

        .features-list li, .instructions-list li {
          margin-bottom: 8px;
        }
      `}</style>
    </div>
  );
}
