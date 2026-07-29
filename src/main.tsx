import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// Inject Google Fonts via DOM to avoid PostCSS @import ordering issues
const link = document.createElement('link')
link.rel = 'stylesheet'
link.href = 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Merriweather:ital,wght@0,400;0,700;1,400&display=swap'
document.head.prepend(link)

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
