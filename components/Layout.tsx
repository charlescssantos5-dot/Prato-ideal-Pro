import React from 'react';
import { HomeIcon, UtensilsIcon, DumbbellIcon, UserIcon } from './Icons';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeTab, onTabChange }) => {
  return (
    <div className="flex flex-col h-screen bg-dark-950 max-w-md mx-auto border-x border-dark-800 relative shadow-2xl overflow-hidden">
      {/* Content Area */}
      <div className="flex-1 overflow-y-auto no-scrollbar pb-20">
        {children}
      </div>

      {/* Bottom Navigation */}
      <div className="absolute bottom-0 left-0 right-0 bg-dark-900/95 backdrop-blur-md border-t border-dark-800 h-16 flex justify-around items-center pb-2 shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.5)] z-50">
        <button 
          onClick={() => onTabChange('home')}
          className={`flex flex-col items-center justify-center w-16 h-full transition-all ${activeTab === 'home' ? 'text-brand-500 translate-y-[-2px]' : 'text-zinc-500'}`}
        >
          <HomeIcon className="w-6 h-6 mb-1" />
          <span className="text-[10px] font-medium">Início</span>
        </button>

        <button 
          onClick={() => onTabChange('diet')}
          className={`flex flex-col items-center justify-center w-16 h-full transition-all ${activeTab === 'diet' ? 'text-brand-500 translate-y-[-2px]' : 'text-zinc-500'}`}
        >
          <UtensilsIcon className="w-6 h-6 mb-1" />
          <span className="text-[10px] font-medium">Dieta</span>
        </button>

        <button 
          onClick={() => onTabChange('workout')}
          className={`flex flex-col items-center justify-center w-16 h-full transition-all ${activeTab === 'workout' ? 'text-brand-500 translate-y-[-2px]' : 'text-zinc-500'}`}
        >
          <DumbbellIcon className="w-6 h-6 mb-1" />
          <span className="text-[10px] font-medium">Treino</span>
        </button>

        <button 
          onClick={() => onTabChange('profile')}
          className={`flex flex-col items-center justify-center w-16 h-full transition-all ${activeTab === 'profile' ? 'text-brand-500 translate-y-[-2px]' : 'text-zinc-500'}`}
        >
          <UserIcon className="w-6 h-6 mb-1" />
          <span className="text-[10px] font-medium">Perfil</span>
        </button>
      </div>
    </div>
  );
};