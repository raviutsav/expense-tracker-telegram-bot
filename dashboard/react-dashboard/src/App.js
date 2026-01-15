import React, { useState } from 'react';
import Dashboard from './components/Dashboard';
import BotGuide from './components/BotGuide';
import { ThemeProvider } from './components/ThemeContext';

function App() {
  // Check for user_id in URL
  const urlParams = new URLSearchParams(window.location.search);
  const userId = urlParams.get('user_id');
  const isAuthenticated = !!userId;

  // Default to bot-guide if not authenticated
  const [currentView, setCurrentView] = useState(isAuthenticated ? 'dashboard' : 'bot-guide');

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <Dashboard
            onNavigate={setCurrentView}
            userId={userId}
            isAuthenticated={isAuthenticated}
          />
        );
      case 'bot-guide':
        return (
          <BotGuide
            onNavigate={setCurrentView}
            isAuthenticated={isAuthenticated}
          />
        );
      default:
        return (
          <Dashboard
            onNavigate={setCurrentView}
            userId={userId}
            isAuthenticated={isAuthenticated}
          />
        );
    }
  };

  return (
    <ThemeProvider defaultTheme="system" storageKey="expense-theme">
      {renderView()}
    </ThemeProvider>
  );
}

export default App;
