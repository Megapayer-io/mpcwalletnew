import React, { useState } from 'react'
import { 
  Menu, 
  Search, 
  Bell, 
  Settings, 
  User, 
  LogOut, 
  Shield,
  ChevronDown,
  Wallet,
  Eye,
  EyeOff
} from 'lucide-react'
import { useWalletStore } from '../store/walletStore'

interface DesktopHeaderProps {
  onToggleSidebar: () => void
}

const DesktopHeader: React.FC<DesktopHeaderProps> = ({ onToggleSidebar }) => {
  const [showBalance, setShowBalance] = useState(true)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const { currentAccount, balance, usdBalance, currentNetwork, lock } = useWalletStore()

  const handleLock = () => {
    lock()
    setShowUserMenu(false)
  }

  return (
    <header className="bg-white/80 backdrop-blur-xl border-b border-gray-200/50 px-6 py-4 shadow-sm">
      <div className="flex items-center justify-between">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Menu className="w-5 h-5 text-gray-600" />
          </button>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search transactions, tokens, or addresses..."
              className="pl-10 pr-4 py-2 w-80 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Center Section - Balance */}
        {currentAccount && (
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">
                    {currentNetwork?.symbol?.charAt(0) || 'E'}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-600">{currentNetwork?.name || 'Ethereum'}</p>
                  <p className="font-semibold text-gray-900">
                    {showBalance ? balance : '••••••'} {currentNetwork?.symbol || 'ETH'}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="text-center">
              <p className="text-sm text-gray-600">USD Value</p>
              <p className="font-bold text-green-600">
                {showBalance ? `$${usdBalance}` : '••••••'}
              </p>
            </div>
            
            <button
              onClick={() => setShowBalance(!showBalance)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              title={showBalance ? 'Hide balance' : 'Show balance'}
            >
              {showBalance ? (
                <EyeOff className="w-4 h-4 text-gray-600" />
              ) : (
                <Eye className="w-4 h-4 text-gray-600" />
              )}
            </button>
          </div>
        )}

        {/* Right Section */}
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <button className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <Bell className="w-5 h-5 text-gray-600" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
          </button>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              {currentAccount && (
                <div className="text-left">
                  <p className="text-sm font-medium text-gray-900">{currentAccount.name}</p>
                  <p className="text-xs text-gray-500">
                    {currentAccount.address.slice(0, 6)}...{currentAccount.address.slice(-4)}
                  </p>
                </div>
              )}
              <ChevronDown className="w-4 h-4 text-gray-600" />
            </button>

            {/* Dropdown Menu */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-200/50 py-2 z-50">
                <div className="px-4 py-3 border-b border-gray-200/50">
                  <p className="text-sm font-medium text-gray-900">{currentAccount?.name}</p>
                  <p className="text-xs text-gray-500 font-mono">{currentAccount?.address}</p>
                </div>
                
                <div className="py-2">
                  <button className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors">
                    <Settings className="w-4 h-4" />
                    Settings
                  </button>
                  <button className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors">
                    <Shield className="w-4 h-4" />
                    Security
                  </button>
                  <button className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors">
                    <Wallet className="w-4 h-4" />
                    Account Management
                  </button>
                </div>
                
                <div className="border-t border-gray-200/50 py-2">
                  <button
                    onClick={handleLock}
                    className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Lock Wallet
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export default DesktopHeader
