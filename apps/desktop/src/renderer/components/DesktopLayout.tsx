import React from 'react'

interface DesktopLayoutProps {
  title: string
  subtitle?: string
  children: React.ReactNode
}

export const DesktopLayout: React.FC<DesktopLayoutProps> = ({ title, subtitle, children }) => {
  return (
    <div className="h-full w-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <div className="flex items-center justify-between">
          <div className="desktop-fade-in">
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
            {subtitle && (
              <p className="text-sm text-gray-600 mt-1 font-medium">{subtitle}</p>
            )}
          </div>
          
          {/* Desktop-specific header actions */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="font-medium">Desktop App</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-8 desktop-scrollbar overflow-y-auto" style={{ height: 'calc(100vh - 140px)' }}>
        <div className="desktop-slide-in">
          {children}
        </div>
      </div>
    </div>
  )
}
