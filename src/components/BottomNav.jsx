import React from 'react';

const BottomNav = ({ currentView, onNavigate }) => {
  const navItems = [
    { id: 'dashboard', icon: '🏠', label: 'Inicio' },
    { id: 'tracker', icon: '🍽️', label: 'Comidas' },
    { id: 'progress', icon: '📊', label: 'Progreso' },
    { id: 'profile', icon: '👤', label: 'Perfil' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700 px-4 py-3 z-40">
      <div className="max-w-2xl mx-auto flex justify-around items-center">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`flex flex-col items-center space-y-1 transition-colors ${
              currentView === item.id
                ? 'text-blue-400'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <span className="text-2xl">{item.icon}</span>
            <span className="text-xs font-medium">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;
