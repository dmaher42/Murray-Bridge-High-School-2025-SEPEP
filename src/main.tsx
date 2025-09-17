import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import App from './App'

// eslint-disable-next-line no-console
console.log('VITE_SEPEP_API_URL present?', Boolean(import.meta.env.VITE_SEPEP_API_URL))

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
