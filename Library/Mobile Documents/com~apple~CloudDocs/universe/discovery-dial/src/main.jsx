import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { forceReloadIfOld } from './utils/cacheBuster.js'

// Force reload if old version detected
forceReloadIfOld();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
