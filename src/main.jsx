import React from 'react';
import ReactDOM from 'react-dom/client';
import ModernApp from './ModernApp';
import { GoogleOAuthProvider } from '@react-oauth/google';

ReactDOM.createRoot(document.getElementById('root')).render(
  <GoogleOAuthProvider clientId={process.env.GOOGLE_CLIENT_ID}>
    <ModernApp />
  </GoogleOAuthProvider>
);

