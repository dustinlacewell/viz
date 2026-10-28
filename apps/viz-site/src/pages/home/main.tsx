import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@ldlework/phosphor/styles.css'
import '../../shared/base.css'
import '../../shared/site-nav.css'
import './home.css'
import { SiteNav } from '../../shared/SiteNav'
import { App } from './App'

const root = document.getElementById('root')
if (!root) throw new Error('no #root')
createRoot(root).render(
  <StrictMode>
    <SiteNav current="home" />
    <App />
  </StrictMode>,
)
