import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './components/AuthProvider';
import { ThemeContextProvider } from './contexts/ThemeContext'; // Changed from ThemeProvider in example, keeping original name
import { SiteSettingsProvider } from './contexts/SiteSettingsContext';
import App from './App.tsx'; // Keeping original .tsx extension
import './index.css';

createRoot(document.getElementById('root')!).render( // Keeping original createRoot
  <StrictMode> {/* Keeping original StrictMode */}
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
