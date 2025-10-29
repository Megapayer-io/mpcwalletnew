import React, { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import DesktopSidebar from './DesktopSidebar'
import DesktopHeader from './DesktopHeader.jsx'
import { useWalletStore } from '../store/walletStore'

interface DesktopLayoutProps {
  children: React.ReactNode
}

const DesktopLayout: React.FC<DesktopLayoutProps> = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const { refreshBalance } = useWalletStore()
  const location = useLocation()

  useEffect(() => {
    // Refresh balance when route changes
    refreshBalance()
  }, [location.pathname, refreshBalance])

  return (
    <div className="h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex overflow-hidden">
      {/* Sidebar */}
      <DesktopSidebar 
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <DesktopHeader 
          onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
        
        {/* Content */}
        <main className="flex-1 overflow-auto">
          <div className="h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

export default DesktopLayout