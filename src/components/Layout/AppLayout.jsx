import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import './Layout.css';

export default function AppLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="app-layout">
            <div
                className={`sidebar-overlay ${sidebarOpen ? 'sidebar-overlay--visible' : ''}`}
                onClick={() => setSidebarOpen(false)}
            />
            <div className={`app-layout__sidebar ${sidebarOpen ? 'app-layout__sidebar--open' : ''}`}>
                <Sidebar />
            </div>
            <div className="app-layout__navbar">
                <Navbar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
            </div>
            <main className="app-layout__main">
                <Outlet />
            </main>
        </div>
    );
}
