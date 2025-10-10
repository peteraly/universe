import { useState, useRef } from 'react';
import { motion } from 'framer-motion';

// Simplified test component to debug dial visibility
const DialTestComponent = () => {
  const [testState, setTestState] = useState({
    isVisible: true,
    backgroundColor: '#000000',
    borderColor: '#FFFFFF',
    textColor: '#FFFFFF'
  });

  const dialRef = useRef(null);

  const toggleVisibility = () => {
    setTestState(prev => ({
      ...prev,
      isVisible: !prev.isVisible
    }));
  };

  const changeTheme = () => {
    setTestState(prev => ({
      ...prev,
      backgroundColor: prev.backgroundColor === '#000000' ? '#FFFFFF' : '#000000',
      borderColor: prev.borderColor === '#FFFFFF' ? '#000000' : '#FFFFFF',
      textColor: prev.textColor === '#FFFFFF' ? '#000000' : '#FFFFFF'
    }));
  };

  return (
    <div className="min-h-screen bg-white p-4">
      {/* Debug Controls */}
      <div className="mb-4 p-4 bg-gray-100 rounded-lg">
        <h2 className="text-lg font-bold mb-2">Dial Debug Controls</h2>
        <div className="space-x-2">
          <button
            onClick={toggleVisibility}
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            Toggle Visibility
          </button>
          <button
            onClick={changeTheme}
            className="px-4 py-2 bg-green-500 text-white rounded"
          >
            Toggle Theme
          </button>
        </div>
        <div className="mt-2 text-sm">
          <p>Visible: {testState.isVisible ? 'Yes' : 'No'}</p>
          <p>Background: {testState.backgroundColor}</p>
          <p>Border: {testState.borderColor}</p>
          <p>Text: {testState.textColor}</p>
        </div>
      </div>

      {/* Test Dial */}
      {testState.isVisible && (
        <div className="flex justify-center">
          <motion.div
            ref={dialRef}
            className="relative w-[280px] h-[280px] rounded-full border-2"
            style={{
              backgroundColor: testState.backgroundColor,
              borderColor: testState.borderColor,
              color: testState.textColor
            }}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {/* Red pointer at top */}
            <div className="absolute left-1/2 top-[-10px] -translate-x-1/2 z-10">
              <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[10px] border-b-[#E63946]" />
            </div>

            {/* Tick marks */}
            {[...Array(36)].map((_, i) => (
              <div
                key={i}
                className="absolute left-1/2 top-1/2 origin-[0_100%]"
                style={{
                  transform: `rotate(${i * 10}deg) translate(-1px, -130px)`,
                  width: i % 3 === 0 ? 2 : 1,
                  height: i % 3 === 0 ? 12 : 6,
                  backgroundColor: testState.borderColor
                }}
              />
            ))}

            {/* Category labels */}
            {['N', 'E', 'S', 'W'].map((pos, idx) => (
              <div
                key={pos}
                className="absolute text-center text-sm font-medium"
                style={{
                  left: '50%',
                  top: '50%',
                  transform: {
                    'N': 'translate(-50%, -140px)',
                    'E': 'translate(120px, -50%) rotate(90deg)',
                    'S': 'translate(-50%, 120px) rotate(180deg)',
                    'W': 'translate(-140px, -50%) rotate(-90deg)'
                  }[pos],
                  color: testState.textColor
                }}
              >
                {['Social', 'Education', 'Recreation', 'Professional'][idx]}
              </div>
            ))}

            {/* Center indicator */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
              <div className="text-lg font-bold" style={{ color: testState.textColor }}>
                TEST DIAL
              </div>
              <div className="text-xs" style={{ color: testState.textColor }}>
                Click to test
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Gesture Test Area */}
      <div className="mt-8 p-4 bg-gray-100 rounded-lg">
        <h3 className="text-lg font-bold mb-2">Gesture Test Area</h3>
        <div
          className="w-full h-32 bg-blue-200 rounded-lg flex items-center justify-center cursor-pointer"
          onTouchStart={(e) => console.log('Touch Start:', e.touches[0])}
          onTouchMove={(e) => console.log('Touch Move:', e.touches[0])}
          onTouchEnd={(e) => console.log('Touch End')}
          onClick={() => console.log('Click detected')}
        >
          <p className="text-gray-600">Touch/Click here to test gestures</p>
        </div>
      </div>

      {/* Console Output */}
      <div className="mt-4 p-4 bg-black text-green-400 rounded-lg font-mono text-sm">
        <h4 className="text-white mb-2">Console Output:</h4>
        <p>Check browser console for gesture events</p>
      </div>
    </div>
  );
};

export default DialTestComponent;
