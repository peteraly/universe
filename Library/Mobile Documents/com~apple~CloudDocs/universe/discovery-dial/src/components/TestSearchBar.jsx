import React from 'react';

const TestSearchBar = () => {
  console.log('🟢 TEST SEARCH BAR RENDERING!!!');
  
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 999999,
      background: 'red',
      color: 'white',
      padding: '30px',
      textAlign: 'center',
      fontSize: '24px',
      fontWeight: 'bold',
      border: '10px solid yellow'
    }}>
      ⚠️ TEST SEARCH BAR - CAN YOU SEE THIS? ⚠️
      <br />
      <input
        type="text"
        placeholder="Type here to test..."
        style={{
          marginTop: '10px',
          padding: '15px',
          fontSize: '18px',
          width: '50%',
          border: '3px solid black'
        }}
      />
    </div>
  );
};

export default TestSearchBar;

