import React from 'react'
import { useLocation, Link } from 'react-router-dom'
import { 
  Home, 
  Send, 
  Download, 
  History, 
  Image, 
  Globe, 
  User, 
  Zap, 
  Shield,
  Settings,
  ChevronLeft,
  ChevronRight,
  Wallet
} from 'lucide-react'
import { useWalletStore } from '../store/walletStore'

interface DesktopSidebarProps {
  collapsed: boolean
  onToggle: () => void
}

const DesktopSidebar: React.FC<DesktopSidebarProps> = ({ collapsed, onToggle }) => {
  const location = useLocation()
  const { currentAccount, balance, usdBalance, currentNetwork } = useWalletStore()

  const navigation = [
    { name: 'Dashboard', href: '/', icon: Home, color: 'text-blue-600' },
    { name: 'Send', href: '/send', icon: Send, color: 'text-red-600' },
    { name: 'Receive', href: '/receive', icon: Download, color: 'text-green-600' },
    { name: 'History', href: '/history', icon: History, color: 'text-purple-600' },
    { name: 'NFTs', href: '/nfts', icon: Image, color: 'text-pink-600' },
    { name: 'Networks', href: '/networks', icon: Globe, color: 'text-indigo-600' },
  ]

  const accountNavigation = [
    { name: 'Account', href: '/account', icon: User, color: 'text-blue-600' },
    { name: 'Tokens', href: '/tokens', icon: Zap, color: 'text-orange-600' },
    { name: 'Hardware', href: '/hardware', icon: Shield, color: 'text-green-600' },
    { name: 'Settings', href: '/settings', icon: Settings, color: 'text-gray-600' },
  ]

  const isActive = (href: string) => {
    if (href === '/') {
      return location.pathname === '/'
    }
    return location.pathname.startsWith(href)
  }

  return (
    <div className={`bg-white/80 backdrop-blur-xl border-r border-gray-200/50 transition-all duration-300 ${
      collapsed ? 'w-16' : 'w-72'
    } flex flex-col h-full shadow-xl`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200/50">
        <div className={`flex items-center ${collapsed ? 'justify-center' : 'justify-between'}`}>
          {!collapsed && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">MPC Wallet</h1>
                <p className="text-sm text-gray-500">Desktop</p>
              </div>
            </div>
          )}
          <button
            onClick={onToggle}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {collapsed ? (
              <ChevronRight className="w-5 h-5 text-gray-600" />
            ) : (
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            )}
          </button>
        </div>
      </div>

      {/* Wallet Info */}
      {!collapsed && currentAccount && (
        <div className="p-4 border-b border-gray-200/50">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-4 border border-blue-200/50">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                {currentAccount.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 truncate">{currentAccount.name}</p>
                <p className="text-sm text-gray-500 font-mono">
                  {currentAccount.address.slice(0, 6)}...{currentAccount.address.slice(-4)}
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Balance</span>
                <span className="font-bold text-gray-900">{balance} {currentNetwork?.symbol || 'ETH'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">USD Value</span>
                <span className="font-semibold text-green-600">${usdBalance}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          <div className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon
              const active = isActive(item.href)
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center ${collapsed ? 'justify-center px-3' : 'gap-3 px-4'} py-3 rounded-xl transition-all duration-200 group ${
                    active
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${active ? 'text-white' : item.color}`} />
                  {!collapsed && (
                    <span className="font-medium">{item.name}</span>
                  )}
                </Link>
              )
            })}
          </div>

          {/* Account Section */}
          <div className="mt-8">
            <div className="px-4 mb-3">
              {!collapsed && (
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Account
                </h3>
              )}
            </div>
            <div className="space-y-1">
              {accountNavigation.map((item) => {
                const Icon = item.icon
                const active = isActive(item.href)
                
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center ${collapsed ? 'justify-center px-3' : 'gap-3 px-4'} py-3 rounded-xl transition-all duration-200 group ${
                      active
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${active ? 'text-white' : item.color}`} />
                    {!collapsed && (
                      <span className="font-medium">{item.name}</span>
                    )}
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      {!collapsed && (
        <div className="p-4 border-t border-gray-200/50">
          <div className="text-center">
            <p className="text-xs text-gray-500">MPC Wallet Desktop</p>
            <p className="text-xs text-gray-400">v1.0.0</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default DesktopSidebar