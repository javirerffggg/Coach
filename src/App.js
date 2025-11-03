import React, { useState, useEffect } from 'react';
import useStore from './store/useStore';
import SetupWizard from './components/SetupWizard';
import Dashboard from './components/Dashboard';
import FoodTracker from './components/FoodTracker';
import FoodManager from './components/FoodManager';
import Progress from './components/Progress';
import PlanView from './components/PlanView';
import Profile from './components/Profile';
import BottomNav from './components/BottomNav';

function App() {
  const user = useStore((state) => state.user);
  const refreshMacros = useStore((state) => state.refreshMacros);
  const [currentView, setCurrentView] = useState('dashboard');

  useEffect(() => {
    if (user.setupComplete) {
      refreshMacros();
    }
  }, [user.setupComplete, refreshMacros]);

  // Si no ha completado el setup, mostrar wizard
  if (!user.setupComplete) {
    return <SetupWizard />;
  }

  const handleNavigate = (view) => {
    setCurrentView(view);
    window.scrollTo(0, 0);
  };

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard onNavigate={handleNavigate} />;
      case 'tracker':
        return <FoodTracker onNavigate={handleNavigate} />;
      case 'foods':
        return <FoodManager onNavigate={handleNavigate} />;
      case 'progress':
        return <Progress onNavigate={handleNavigate} />;
      case 'plan':
        return <PlanView onNavigate={handleNavigate} />;
      case 'profile':
        return <Profile onNavigate={handleNavigate} />;
      default:
        return <Dashboard onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="App">
      {renderView()}
      <BottomNav currentView={currentView} onNavigate={handleNavigate} />
    </div>
  );
}

export default App;
