import React, { useState } from 'react';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import { ToastProvider } from './components/Toast';

const App: React.FC = () => {
    const [currentView, setCurrentView] = useState<'landing' | 'dashboard'>('landing');

    return (
        <ToastProvider>
            {currentView === 'landing' ? (
                <LandingPage onEnter={() => setCurrentView('dashboard')} />
            ) : (
                <Dashboard onBack={() => setCurrentView('landing')} />
            )}
        </ToastProvider>
    );
};

export default App;
