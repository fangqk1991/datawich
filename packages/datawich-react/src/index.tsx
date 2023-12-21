import ReactDOM from 'react-dom/client'
import React from 'react'
import { App } from './app/App'
import { SessionProvider } from '@fangcha/auth-react'

const app = ReactDOM.createRoot(document.getElementById('app')!)
app.render(
  <React.StrictMode>
    <SessionProvider allowAnonymous={false}>
      <App />
    </SessionProvider>
  </React.StrictMode>
)
