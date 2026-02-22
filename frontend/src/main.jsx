import { StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { FullScreenLoader } from './components/ui/FullScreenLoader'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Suspense fallback={<FullScreenLoader />}>
        <App />
      </Suspense>
    </BrowserRouter>
  </StrictMode>,
)
