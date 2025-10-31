'use client';

import { useState, useEffect } from 'react';
import { CustomIcons } from './icons/CustomIcons';

export function MobileWarning() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const mobileKeywords = [
        'android', 'iphone', 'ipad', 'ipod', 'blackberry', 
        'windows phone', 'mobile', 'opera mini', 'iemobile'
      ];
      
      const isMobileDevice = mobileKeywords.some(keyword => userAgent.includes(keyword));
      const isSmallScreen = window.innerWidth <= 768;
      
      setIsMobile(isMobileDevice || isSmallScreen);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (!isMobile) return null;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-megapayer-accent/20 via-megapayer-violet/10 to-megapayer-teal/20 backdrop-blur-md flex items-center justify-center p-3 z-50">
      <div className="megapayer-panel rounded-2xl shadow-2xl max-w-sm w-full p-6 relative border border-megapayer-border/50 backdrop-blur-xl bg-white/95 overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Decorative Background Elements */}
        <div className="absolute -top-10 -right-10 w-20 h-20 bg-gradient-to-br from-megapayer-accent/10 to-megapayer-violet/5 rounded-full"></div>
        <div className="absolute -bottom-10 -left-10 w-16 h-16 bg-gradient-to-br from-megapayer-teal/10 to-megapayer-emerald/5 rounded-full"></div>
        
        <div className="text-center relative z-10">
          {/* Icon */}
          <div className="w-16 h-16 bg-gradient-to-br from-megapayer-emerald via-megapayer-teal to-megapayer-violet rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <CustomIcons.Smartphone className="w-8 h-8 text-white" />
          </div>
          
          {/* Title */}
          <h1 className="text-xl font-bold text-megapayer-text mb-3 font-heading">
            Mobile App Coming Soon!
          </h1>
          
          {/* Message */}
          <div className="space-y-3 mb-6">
            <p className="text-megapayer-muted text-sm leading-relaxed">
              This web application is designed for desktop and tablet use. 
              For the best mobile experience, we're launching a dedicated mobile app soon!
            </p>
            
            <div className="megapayer-panel-soft border border-megapayer-border-soft rounded-lg p-3">
              <div className="flex items-center space-x-2 mb-2">
                <CustomIcons.AlertTriangle className="w-4 h-4 text-megapayer-teal flex-shrink-0" />
                <span className="text-xs font-semibold text-megapayer-text">Desktop Recommended</span>
              </div>
              <p className="text-xs text-megapayer-muted">
                For optimal security and user experience, please use Megapayer on a desktop or tablet device.
              </p>
            </div>

            {/* Whitepaper Link */}
            <div className="megapayer-panel-soft border border-megapayer-border-soft rounded-lg p-3">
              <div className="flex items-center space-x-2 mb-2">
                <CustomIcons.FileText className="w-4 h-4 text-megapayer-violet flex-shrink-0" />
                <span className="text-xs font-semibold text-megapayer-text">Learn More</span>
              </div>
              <p className="text-xs text-megapayer-muted mb-2">
                Read our comprehensive whitepaper to understand Megapayer's privacy-first approach.
              </p>
              <a
                href="https://megapayerwalletwhitepaper.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-1 text-xs text-megapayer-violet hover:text-megapayer-accent transition-colors duration-200"
              >
                <span>Read our whitepaper</span>
                <CustomIcons.ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
          
          {/* Features */}
          <div className="space-y-2 mb-6">
            <h3 className="text-xs font-semibold text-megapayer-text mb-2">What's Coming:</h3>
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-gradient-to-r from-megapayer-emerald to-megapayer-teal rounded-full"></div>
                <span className="text-xs text-megapayer-muted">Native mobile app</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-gradient-to-r from-megapayer-emerald to-megapayer-teal rounded-full"></div>
                <span className="text-xs text-megapayer-muted">Touch-optimized interface</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-gradient-to-r from-megapayer-emerald to-megapayer-teal rounded-full"></div>
                <span className="text-xs text-megapayer-muted">Biometric authentication</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-gradient-to-r from-megapayer-emerald to-megapayer-teal rounded-full"></div>
                <span className="text-xs text-megapayer-muted">Enhanced mobile security</span>
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="space-y-2">
            <button
              onClick={() => window.close()}
              className="w-full megapayer-btn-primary py-2.5 px-4 rounded-lg text-sm font-semibold transition-all duration-200 hover:scale-[1.02] hover:shadow-lg flex items-center justify-center space-x-2"
            >
              <CustomIcons.X className="w-4 h-4" />
              <span>Close</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
