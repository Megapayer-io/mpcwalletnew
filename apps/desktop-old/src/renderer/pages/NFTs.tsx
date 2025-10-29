import React from 'react'
import { Image, Plus, Search } from 'lucide-react'

const NFTs: React.FC = () => {
  return (
    <div className="h-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl border border-gray-200/50 p-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Image className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">NFTs</h1>
              <p className="text-gray-600">Manage your NFT collection</p>
            </div>
          </div>
          
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gradient-to-br from-pink-200 to-purple-300 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <Image className="w-10 h-10 text-pink-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">No NFTs Found</h3>
            <p className="text-gray-600 mb-6">Your NFT collection will appear here</p>
            <button className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-xl hover:from-pink-700 hover:to-purple-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl hover:scale-105">
              <Plus className="w-5 h-5 mr-2" />
              Import NFTs
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NFTs