import React from 'react';
import type { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';
import { SidebarProvider, useSidebar } from '@/contexts/SidebarContext';
import { usePageTracking } from '@/hooks/usePageTracking';

interface LayoutProps {
  children: ReactNode;
}

const LayoutContent: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const { isOpen, isMobile, close } = useSidebar();
  
  // 启用页面追踪
  usePageTracking();
  
  // 不显示侧边栏的页面
  const noSidebarPages = ['/login', '/signup'];
  const showSidebar = !noSidebarPages.includes(location.pathname);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <div className="relative flex flex-1">
        {showSidebar && <Sidebar />}
        
        {/* 移动端遮罩层 */}
        {showSidebar && isOpen && isMobile && (
          <div
            className="fixed inset-0 z-30 bg-black/50 md:hidden"
            onClick={close}
            style={{ top: '4rem' }} // 考虑Header高度
          />
        )}
        
        <main className={`flex-1 transition-all duration-200 ${
          showSidebar && isOpen && !isMobile 
            ? 'ml-64' 
            : ''
        }`}>
          <div className="container mx-auto p-4 md:p-6 min-h-[calc(100vh-8rem)] max-w-7xl flex flex-col">
            {children}
          </div>
        </main>
      </div>
      
      <Footer />
    </div>
  );
};

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <SidebarProvider>
      <LayoutContent>{children}</LayoutContent>
    </SidebarProvider>
  );
};

export default Layout;