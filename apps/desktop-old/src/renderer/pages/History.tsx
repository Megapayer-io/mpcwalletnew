import React from 'react'
import { Clock, ArrowUpRight, ArrowDownLeft, ExternalLink } from 'lucide-react'

const History: React.FC = () => {
  const transactions = [
    {
      id: 1,
      type: 'send',
      amount: '0.5 ETH',
      to: '0x742d...35Cc',
      time: '2 hours ago',
      status: 'completed',
      value: '$1,245.67',
      hash: '0x1234...5678'
    },
    {
      id: 2,
      type: 'receive',
      amount: '1.2 ETH',
      from: '0x8a3d...9F2e',
      time: '5 hours ago',
      status: 'completed',
      value: '$2,891.34',
      hash: '0x8765...4321'
    },
    {
      id: 3,
      type: 'send',
      amount: '100 USDC',
      to: '0x5c7d...2A8b',
      time: '1 day ago',
      status: 'completed',
      value: '$100.00',
      hash: '0xabcd...efgh'
    }
  ]

  return (
    <div className="h-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl border border-gray-200/50 p-8 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Transaction History</h1>
              <p className="text-gray-600">View all your transactions</p>
            </div>
          </div>
        </div>

        {/* Transactions */}
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl border border-gray-200/50 p-8">
          <div className="space-y-4">
            {transactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between p-6 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-all duration-300">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                    tx.type === 'send' ? 'bg-red-100' : 'bg-green-100'
                  }`}>
                    {tx.type === 'send' ? (
                      <ArrowUpRight className="w-6 h-6 text-red-600" />
                    ) : (
                      <ArrowDownLeft className="w-6 h-6 text-green-600" />
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{tx.amount}</p>
                    <p className="text-sm text-gray-600">
                      {tx.type === 'send' ? 'To' : 'From'} {tx.type === 'send' ? tx.to : tx.from}
                    </p>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {tx.time}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">{tx.value}</p>
                  <p className="text-sm text-gray-500">{tx.status}</p>
                  <button className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1">
                    <ExternalLink className="w-3 h-3" />
                    View on Explorer
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default History