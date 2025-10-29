import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import DesktopLayout from './components/DesktopLayout'
import Dashboard from './pages/Dashboard'
import SendPage from './pages/Send'
import Receive from './pages/Receive'
import History from './pages/History'
import NFTs from './pages/NFTs'
import Networks from './pages/Networks'
import Account from './pages/Account'
import Tokens from './pages/Tokens'
import Hardware from './pages/Hardware'
import Settings from './pages/Settings'
import Unlock from './pages/Unlock'
import Setup from './pages/Setup'
import { useWalletStore } from './store/walletStore'

function App() {
  const { hasWallet, isUnlocked } = useWalletStore()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate loading time for smooth experience
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1500)

    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6 animate-pulse">
            <div className="w-10 h-10 bg-white rounded-2xl"></div>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">MPC Wallet Desktop</h2>
          <p className="text-blue-200">Loading your secure wallet...</p>
          <div className="mt-6 w-48 h-1 bg-white/20 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    )
  }

  // Show setup if no wallet exists
  if (!hasWallet) {
    return (
      <Router>
        <Routes>
          <Route path="/setup" element={<Setup />} />
          <Route path="*" element={<Navigate to="/setup" replace />} />
        </Routes>
      </Router>
    )
  }

  // Show unlock if wallet is locked
  if (!isUnlocked) {
    return (
      <Router>
        <Routes>
          <Route path="/unlock" element={<Unlock />} />
          <Route path="*" element={<Navigate to="/unlock" replace />} />
        </Routes>
      </Router>
    )
  }

  // Main app with all features
  return (
    <Router>
      <DesktopLayout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/send" element={<SendPage />} />
          <Route path="/receive" element={<Receive />} />
          <Route path="/history" element={<History />} />
          <Route path="/nfts" element={<NFTs />} />
          <Route path="/networks" element={<Networks />} />
          <Route path="/account" element={<Account />} />
          <Route path="/tokens" element={<Tokens />} />
          <Route path="/hardware" element={<Hardware />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </DesktopLayout>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'rgba(0, 0, 0, 0.8)',
            color: '#fff',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          },
        }}
      />
    </Router>
  )
}

export default App