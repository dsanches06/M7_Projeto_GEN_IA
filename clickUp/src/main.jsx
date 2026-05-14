import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from '@/App.jsx'

// Suppress browser extension messaging errors
window.addEventListener('unhandledrejection', (event) => {
  if (event.reason?.message?.includes('listener indicated an asynchronous response')) {
    event.preventDefault();
  }
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
