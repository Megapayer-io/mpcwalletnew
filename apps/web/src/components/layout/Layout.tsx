'use client';

import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

interface LayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export const Layout: React.FC<LayoutProps> = ({ children, title, subtitle }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 flex">
      {/* Sidebar */}
      <Sidebar isCollapsed={sidebarCollapsed} onToggle={toggleSidebar} />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <Header title={title} subtitle={subtitle} />
        
        {/* Page Content */}
        <main className="flex-1 p-6 lg:p-8">
          <div className="max-w-7xl mx-auto h-full">
            <div className="animate-fade-in-up">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};