import React from 'react'
import { DesktopLayout } from '../components/DesktopLayout'
import { Wallet, Activity, Shield, Star, TrendingUp, DollarSign } from 'lucide-react'

export const Dashboard: React.FC = () => {
  return (
    <DesktopLayout title="Dashboard" subtitle="Professional Web3 Desktop Portfolio">
      <div className="space-y-8">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl p-8 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">Welcome to MPC Wallet Desktop!</h1>
                <p className="text-blue-100 text-lg">Your professional Web3 desktop experience</p>
              </div>
              <div className="text-right">
                <p className="text-blue-100 text-sm mb-1">Portfolio Value</p>
                <p className="text-4xl font-bold">$0.00</p>
                <div className="flex items-center justify-end gap-1 mt-1">
                  <TrendingUp className="w-4 h-4 text-green-300" />
                  <span className="text-sm font-medium text-green-300">+0%</span>
                </div>
              </div>
            </div>
          </div>
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full"></div>
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/5 rounded-full"></div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              title: 'Total Balance',
              value: '0.0000',
              subtitle: 'ETH',
              usdValue: '≈ $0.00',
              icon: Wallet,
              color: 'from-blue-500 to-blue-600',
              bgColor: 'from-blue-50 to-blue-100',
              change: '+0%'
            },
            {
              title: 'Active Network',
              value: 'Not Connected',
              subtitle: 'Chain ID: N/A',
              icon: Activity,
              color: 'from-green-500 to-green-600',
              bgColor: 'from-green-50 to-green-100',
              change: 'Disconnected'
            },
            {
              title: 'Security Status',
              value: 'Locked',
              subtitle: 'Wallet Locked',
              icon: Shield,
              color: 'from-red-500 to-red-600',
              bgColor: 'from-red-50 to-red-100',
              change: 'Inactive'
            },
            {
              title: 'Custom Tokens',
              value: '0',
              subtitle: 'ERC-20 Tokens',
              icon: Star,
              color: 'from-purple-500 to-purple-600',
              bgColor: 'from-purple-50 to-purple-100',
              change: '+0 today'
            }
          ].map((stat, index) => {
            const Icon = stat.icon
            return (
              <div 
                key={index} 
                className="desktop-card p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 desktop-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 bg-gradient-to-br ${stat.bgColor} rounded-xl flex items-center justify-center shadow-lg`}>
                    <Icon className={`w-6 h-6 ${stat.color.replace('from-', 'text-').replace(' to-', '-')}`} />
                  </div>
                  <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                    {stat.change}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-500 mb-1">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</p>
                  <p className="text-sm text-gray-600">{stat.subtitle}</p>
                  {stat.usdValue && (
                    <p className="text-sm text-gray-500 mt-1">{stat.usdValue}</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Desktop Features */}
        <div className="desktop-card p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900">Desktop Features</h3>
              <p className="text-gray-600">Enhanced desktop experience with native integrations</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900">Native Desktop Features</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  System tray integration with quick actions
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Native file dialogs for wallet import/export
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Desktop notifications for transactions
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Keyboard shortcuts and native menus
                </li>
              </ul>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900">Professional Interface</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  Custom title bar with window controls
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  Desktop-optimized sidebar and navigation
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  Native scrollbars and desktop styling
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  Auto-updater and installer packages
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </DesktopLayout>
  )
}
