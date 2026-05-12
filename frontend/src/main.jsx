import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { ScholarshipProvider } from './context/ScholarshipContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <ScholarshipProvider>
        <App />
      </ScholarshipProvider>
    </BrowserRouter>
  </StrictMode>,
)
