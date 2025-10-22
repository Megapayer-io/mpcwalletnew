import React, { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom'
import { DesktopLayout } from './components/DesktopLayout'
import { TitleBar } from './components/TitleBar'
import { DesktopSidebar } from './components/DesktopSidebar'
import { DesktopContent } from './components/DesktopContent'

// Import pages (we'll create these next)
import { Dashboard } from './pages/Dashboard'
import { Send } from './pages/Send'
import { Receive } from './pages/Receive'
import { History } from './pages/History'
import { NFTs } from './pages/NFTs'
import { Networks } from './pages/Networks'
import { Account } from './pages/Account'
import { Tokens } from './pages/Tokens'
import { Settings } from './pages/Settings'
import { Setup } from './pages/Setup'
import { Unlock } from './pages/Unlock'

// Desktop-specific navigation handler
const DesktopNavigationHandler: React.FC = () => {
  const navigate = useNavigate()

  useEffect(() => {
    // Listen for navigation from menu/tray
    const handleNavigateTo = (path: string) => {
      navigate(path)
    }

    const handleMenuAction = (action: string) => {
      switch (action) {
        case 'new-wallet':
          navigate('/setup')
          break
        case 'import-wallet':
          navigate('/setup?mode=import')
          break
        case 'export-wallet':
          // Handle export wallet
          break
        case 'about':
          // Show about dialog
          break
      }
    }

    if (window.electronAPI) {
      window.electronAPI.onNavigateTo(handleNavigateTo)
      window.electronAPI.onMenuAction(handleMenuAction)
    }

    return () => {
      if (window.electronAPI) {
        window.electronAPI.removeAllListeners('navigate-to')
        window.electronAPI.removeAllListeners('menu-action')
      }
    }
  }, [navigate])

  return null
}

const App: React.FC = () => {
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    // Initialize desktop app
    const initDesktop = async () => {
      try {
        // Check if we have electron API
        if (window.electronAPI) {
          const version = await window.electronAPI.getAppVersion()
          console.log('MPC Wallet Desktop v' + version)
        }
        
        setIsReady(true)
      } catch (error) {
        console.error('Failed to initialize desktop app:', error)
        setIsReady(true) // Still show the app
      }
    }

    initDesktop()
  }, [])

  if (!isReady) {
    return (
      <div className="h-screen w-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <p className="text-gray-600 font-medium">Initializing MPC Wallet Desktop...</p>
        </div>
      </div>
    )
  }

  return (
    <Router>
      <div className="h-screen w-screen flex flex-col bg-gray-50">
        <TitleBar />
        <div className="flex flex-1 overflow-hidden">
          <DesktopSidebar />
          <DesktopContent>
            <DesktopNavigationHandler />
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/send" element={<Send />} />
              <Route path="/receive" element={<Receive />} />
              <Route path="/history" element={<History />} />
              <Route path="/nfts" element={<NFTs />} />
              <Route path="/networks" element={<Networks />} />
              <Route path="/account" element={<Account />} />
              <Route path="/tokens" element={<Tokens />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/setup" element={<Setup />} />
              <Route path="/unlock" element={<Unlock />} />
            </Routes>
          </DesktopContent>
        </div>
      </div>
    </Router>
  )
}

export default App
