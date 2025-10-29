'use client';

import { Send, Download, History, Settings, ExternalLink } from 'lucide-react';

interface QuickActionsProps {
  onSend: () => void;
  onReceive: () => void;
}

export function QuickActions({ onSend, onReceive }: QuickActionsProps) {
  const actions = [
    {
      id: 'send',
      label: 'Send',
      icon: Send,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      hoverColor: 'hover:bg-red-100',
      onClick: onSend
    },
    {
      id: 'receive',
      label: 'Receive',
      icon: Download,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      hoverColor: 'hover:bg-green-100',
      onClick: onReceive
    },
    {
      id: 'history',
      label: 'History',
      icon: History,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      hoverColor: 'hover:bg-blue-100',
      onClick: () => chrome.tabs.create({ url: chrome.runtime.getURL('popup.html#history') })
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
      hoverColor: 'hover:bg-gray-100',
      onClick: () => chrome.runtime.openOptionsPage()
    }
  ];

  return (
    <div className="wallet-card">
      <h3 className="text-sm font-semibold text-gray-900 mb-3">Quick Actions</h3>
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.id}
              onClick={action.onClick}
              className={`
                flex flex-col items-center space-y-2 p-4 rounded-lg transition-all duration-200
                ${action.bgColor} ${action.hoverColor} hover:scale-105 hover:shadow-md
              `}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${action.bgColor}`}>
                <Icon className={`w-4 h-4 ${action.color}`} />
              </div>
              <span className={`text-sm font-medium ${action.color}`}>
                {action.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
