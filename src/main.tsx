import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { LoadingProvider } from './LoadingContext'

createRoot(document.getElementById('root')!).render(
  <LoadingProvider>
    <StrictMode>
      <App />
    </StrictMode>
  </LoadingProvider>,
)
