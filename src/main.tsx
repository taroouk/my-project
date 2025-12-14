import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeContextProvider } from './contexts/ThemeContext';
import { SiteSettingsProvider } from './contexts/SiteSettingsContext';
import App from './App';
import './index.css';

const root = createRoot(document.getElementById('root')!);

root.render(
  <StrictMode>
    <ThemeContextProvider>
      <AuthProvider>
        <BrowserRouter>
          <SiteSettingsProvider>
            <App />
          </SiteSettingsProvider>
        </BrowserRouter>
      </AuthProvider>
    </ThemeContextProvider>
  </StrictMode>
);
