import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        background: 'var(--color-base)',
        overflow: 'hidden',
        width: '100vw',
      }}
    >
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="app-main">
        <Navbar onToggleSidebar={() => setSidebarOpen(prev => !prev)} />
        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}