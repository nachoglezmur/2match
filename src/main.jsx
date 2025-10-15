import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import AppMatching from './AppMatching.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AppMatching />
  </StrictMode>,
)
