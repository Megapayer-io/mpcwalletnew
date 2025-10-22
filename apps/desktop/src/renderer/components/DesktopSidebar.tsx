import React from 'react'
import { NavLink } from 'react-router-dom'
import { useLocation } from 'react-router-dom'
import {
  Home,
  Send,
  Download,
  History,
  Globe,
  Image,
  User,
  Zap,
  Settings,
  Shield,
  Bell,
  HelpCircle
} from 'lucide-react'

export const DesktopSidebar: React.FC = () => {
  const location = useLocation()

  const mainNavigation = [
    { name: 'Dashboard', href: '/', icon: Home, color: 'text-blue-600' },
    { name: 'Send', href: '/send', icon: Send, color: 'text-red-600' },
    { name: 'Receive', href: '/receive', icon: Download, color: 'text-green-600' },
    { name: 'History', href: '/history', icon: History, color: 'text-purple-600' },
    { name: 'NFTs', href: '/nfts', icon: Image, color: 'text-pink-600' },
    { name: 'Networks', href: '/networks', icon: Globe, color: 'text-indigo-600' },
  ]

  const accountNavigation = [
    { name: 'Account Management', href: '/account', icon: User, color: 'text-blue-600' },
    { name: 'Import Tokens', href: '/tokens', icon: Zap, color: 'text-orange-600' },
    { name: 'Hardware Wallet', href: '/hardware', icon: Shield, color: 'text-green-600' },
  ]

  const isActive = (href: string) => {
    if (href === '/') {
      return location.pathname === '/'
    }
    return location.pathname.startsWith(href)
  }

  return (
    <div className="desktop-sidebar flex flex-col">
      {/* Logo Section */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">MPC Wallet</h1>
            <p className="text-xs text-gray-500 font-medium">Professional Web3</p>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {mainNavigation.map((item, index) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.name}
              to={item.href}
              className={`
                group flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-[1.02] hover:shadow-sm
                ${isActive(item.href)
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg transform scale-[1.02]'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                }
              `}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className={`
                w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200
                ${isActive(item.href) 
                  ? 'bg-white/20' 
                  : 'bg-gray-100 group-hover:bg-white group-hover:shadow-sm'
                }
              `}>
                <Icon className={`w-4 h-4 ${isActive(item.href) ? 'text-white' : item.color}`} />
              </div>
              <span className="desktop-fade-in">{item.name}</span>
              {isActive(item.href) && (
                <div className="ml-auto w-2 h-2 bg-white rounded-full animate-pulse"></div>
              )}
            </NavLink>
          )
        })}
      </nav>

      {/* Account & Tools Section */}
      <div className="p-4 border-t border-gray-200">
        <div className="mb-3">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-4">
            Account & Tools
          </p>
        </div>
        <div className="space-y-1">
          {accountNavigation.map((item, index) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.name}
                to={item.href}
                className={`
                  group flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-[1.02] hover:shadow-sm
                  ${isActive(item.href)
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg transform scale-[1.02]'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }
                `}
                style={{ animationDelay: `${(index + mainNavigation.length) * 50}ms` }}
              >
                <div className={`
                  w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200
                  ${isActive(item.href) 
                    ? 'bg-white/20' 
                    : 'bg-gray-100 group-hover:bg-white group-hover:shadow-sm'
                  }
                `}>
                  <Icon className={`w-4 h-4 ${isActive(item.href) ? 'text-white' : item.color}`} />
                </div>
                <span className="desktop-fade-in">{item.name}</span>
                {isActive(item.href) && (
                  <div className="ml-auto w-2 h-2 bg-white rounded-full animate-pulse"></div>
                )}
              </NavLink>
            )
          })}
        </div>
      </div>

      {/* Bottom Section */}
      <div className="p-4 border-t border-gray-200">
        <div className="space-y-1">
          <NavLink
            to="/settings"
            className={`
              group flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-[1.02] hover:shadow-sm
              ${isActive('/settings')
                ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg transform scale-[1.02]'
                : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
              }
            `}
          >
            <div className={`
              w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200
              ${isActive('/settings') 
                ? 'bg-white/20' 
                : 'bg-gray-100 group-hover:bg-white group-hover:shadow-sm'
              }
            `}>
              <Settings className={`w-4 h-4 ${isActive('/settings') ? 'text-white' : 'text-gray-600'}`} />
            </div>
            <span className="desktop-fade-in">Settings</span>
            {isActive('/settings') && (
              <div className="ml-auto w-2 h-2 bg-white rounded-full animate-pulse"></div>
            )}
          </NavLink>
        </div>
      </div>
    </div>
  )
}
