import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import './utils/i18n.ts';
import { I18nProvider } from './lib/i18n';
import { Provider } from 'react-redux';
import { store } from './stores/store.ts';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/auth-context.tsx';
import { I18nextProvider } from 'react-i18next';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <AuthProvider>
          <I18nProvider>
            <App />
          </I18nProvider>
        </AuthProvider>
      </BrowserRouter>
    </Provider>
  </StrictMode>,
)
