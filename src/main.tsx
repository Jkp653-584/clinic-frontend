import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ToastProvider } from './components/ToastContext'
import './index.css'
import "./styles/global.css"
import "./styles/chatbot.css"
import "./styles/layout.css"
import "./styles/home.css"
import "./styles/auth.css"
import "./styles/sidebar.css"
import "./styles/topbar.css"
import "./styles/shared-sections.css"
import "./styles/appointment-page.css"
import "./styles/appointment-history.css"
import "./styles/responsive.css"
import "./styles/owner.css"
import "./styles/cashier.css"

import App from './App.tsx'
import { LoadingProvider } from './components/LoadingContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LoadingProvider>
      <ToastProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ToastProvider>
    </LoadingProvider>
  </StrictMode>
)