import ReactDOM from 'react-dom/client'
import React from 'react'
import { LaunchContainer } from '@fangcha/auth-react'
import { App } from './app/App'

const app = ReactDOM.createRoot(document.getElementById('app')!)
app.render(
  <React.StrictMode>
    <LaunchContainer allowAnonymous={true}>
      <App />
    </LaunchContainer>
  </React.StrictMode>
)
