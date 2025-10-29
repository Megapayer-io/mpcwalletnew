import React from 'react'

interface DesktopContentProps {
  children: React.ReactNode
}

export const DesktopContent: React.FC<DesktopContentProps> = ({ children }) => {
  return (
    <div className="desktop-content desktop-scrollbar">
      <div className="h-full w-full">
        {children}
      </div>
    </div>
  )
}
