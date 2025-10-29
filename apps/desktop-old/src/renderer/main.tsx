import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// Node.js polyfills for browser environment
import { Buffer } from 'buffer'
import process from 'process'

// Set up global polyfills
if (typeof global === 'undefined') {
  (window as any).global = globalThis
}
if (typeof window.Buffer === 'undefined') {
  (window as any).Buffer = Buffer
}
if (typeof window.process === 'undefined') {
  (window as any).process = process
}

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
)

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)