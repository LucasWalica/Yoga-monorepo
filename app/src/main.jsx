import 'ionicons';
import { IonApp } from '@ionic/react';
import { BrowserRouter } from 'react-router-dom';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { AuthProvider } from './context/AuthContext';
import { App } from './App';
import './index.css';

const rootEl = document.getElementById('root');
if (!rootEl) throw new Error('Root element not found');

createRoot(rootEl).render(
  <React.StrictMode>
    <BrowserRouter>
      <IonApp>
        <AuthProvider>
          <App />
        </AuthProvider>
      </IonApp>
    </BrowserRouter>
  </React.StrictMode>
);