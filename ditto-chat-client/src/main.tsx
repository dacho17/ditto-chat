import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import { reduxStore } from './app/store/ReduxStore.ts'
import App from './App.tsx'
import './index.css'


createRoot(document.getElementById('root')!).render(
  <StrictMode>
      <BrowserRouter>
          <Provider store={reduxStore}>
              <App />
          </Provider>
      </BrowserRouter>
  </StrictMode>,
);
