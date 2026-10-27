import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@ldlework/phosphor/styles.css'
import '@ldlework/phosphor-dials/styles.css'
import '../../shared/base.css'
import '../../shared/package-page.css'
import './site.css'
import { SiteNav } from '../../shared/SiteNav'
import { App } from './App'

const root = document.getElementById('root')
if (!root) throw new Error('no #root')
createRoot(root).render(
  <StrictMode>
    <SiteNav current="phosphor-dials" />
    <App />
  </StrictMode>,
)
