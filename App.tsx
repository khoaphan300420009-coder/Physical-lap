
import React, { useState, useEffect } from 'react';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import { ToastProvider } from './components/Toast';
import ApiKeyModal from './components/ApiKeyModal';

const App: React.FC = () => {
    const [currentView, setCurrentView] = useState<'landing' | 'dashboard'>('landing');
    const [showKeyModal, setShowKeyModal] = useState(false);

    // Check for API Key on first load
    useEffect(() => {
        const key = localStorage.getItem('GEMINI_API_KEY');
        if (!key) {
            // Optional: Auto open modal on load if you want to force it
            // setShowKeyModal(true); 
        }
        
        // Listen for custom event to open modal from anywhere
        const handleOpenModal = () => setShowKeyModal(true);
        window.addEventListener('open-api-key-modal', handleOpenModal);
        return () => window.removeEventListener('open-api-key-modal', handleOpenModal);
    }, []);

    const handleSaveKey = (key: string) => {
        localStorage.setItem('GEMINI_API_KEY', key);
    };

    return (
        <ToastProvider>
            {currentView === 'landing' ? (
                <LandingPage onEnter={() => setCurrentView('dashboard')} />
            ) : (
                <Dashboard onBack={() => setCurrentView('landing')} />
            )}
            <ApiKeyModal 
                isOpen={showKeyModal} 
                onClose={() => setShowKeyModal(false)} 
                onSave={handleSaveKey} 
            />
        </ToastProvider>
    );
};

export default App;
