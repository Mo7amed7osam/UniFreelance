import React from 'react';
import { AuthProvider } from '@/auth/AuthProvider';
import { AppRouter } from '@/app/router';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
};

export default App;
