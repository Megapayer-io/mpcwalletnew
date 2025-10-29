'use client';

import { Settings, User, Globe, Shield, Zap, CreditCard } from 'lucide-react';

interface SettingsTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function SettingsTabs({ activeTab, onTabChange }: SettingsTabsProps) {
  const tabs = [
    {
      id: 'account',
      label: 'Account',
      icon: User,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      hoverColor: 'hover:bg-blue-100'
    },
    {
      id: 'networks',
      label: 'Networks',
      icon: Globe,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      hoverColor: 'hover:bg-green-100'
    },
    {
      id: 'tokens',
      label: 'Tokens',
      icon: Zap,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      hoverColor: 'hover:bg-orange-100'
    },
    {
      id: 'security',
      label: 'Security',
      icon: Shield,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      hoverColor: 'hover:bg-red-100'
    },
    {
      id: 'hardware',
      label: 'Hardware',
      icon: CreditCard,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      hoverColor: 'hover:bg-purple-100'
    }
  ];

  return (
    <div className="space-y-1">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`
              w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-200
              ${isActive 
                ? `${tab.bgColor} ${tab.color} border-l-4 border-current` 
                : 'text-gray-700 hover:bg-gray-100'
              }
            `}
          >
            <div className={`
              w-8 h-8 rounded-lg flex items-center justify-center transition-colors
              ${isActive ? 'bg-white shadow-sm' : 'bg-gray-100'}
            `}>
              <Icon className={`w-4 h-4 ${isActive ? tab.color : 'text-gray-600'}`} />
            </div>
            <span className="font-medium">{tab.label}</span>
            {isActive && (
              <div className="ml-auto w-2 h-2 bg-current rounded-full"></div>
            )}
          </button>
        );
      })}
    </div>
  );
}
