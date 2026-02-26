
import React, { useState } from 'react';
import { Icons, COLORS } from '../constants';

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick: () => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
      active ? 'bg-rose-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
    }`}
  >
    {icon}
    <span className="font-medium">{label}</span>
  </button>
);

interface LayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onPageChange: (page: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, currentPage, onPageChange }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <aside className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-gray-900 text-white transition-all duration-300 flex flex-col`}>
        <div className="p-6 flex items-center justify-between border-b border-gray-800">
          <div className={`flex items-center space-x-3 ${!isSidebarOpen && 'hidden'}`}>
            <div className="w-8 h-8 bg-rose-600 rounded flex items-center justify-center font-bold text-xl">WJ</div>
            <span className="font-bold text-lg tracking-tight">Oficina WJ</span>
          </div>
          {!isSidebarOpen && <div className="w-8 h-8 bg-rose-600 rounded flex items-center justify-center font-bold">WJ</div>}
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <SidebarItem 
            icon={<Icons.Dashboard />} 
            label={isSidebarOpen ? "Dashboard" : ""} 
            active={currentPage === 'dashboard'} 
            onClick={() => onPageChange('dashboard')} 
          />
          <SidebarItem 
            icon={<Icons.Users />} 
            label={isSidebarOpen ? "Proprietários" : ""} 
            active={currentPage === 'owners'} 
            onClick={() => onPageChange('owners')} 
          />
          <SidebarItem 
            icon={<Icons.Car />} 
            label={isSidebarOpen ? "Veículos" : ""} 
            active={currentPage === 'vehicles'} 
            onClick={() => onPageChange('vehicles')} 
          />
          <SidebarItem 
            icon={<Icons.Clipboard />} 
            label={isSidebarOpen ? "Serviços" : ""} 
            active={currentPage === 'services'} 
            onClick={() => onPageChange('services')} 
          />
          <SidebarItem 
            icon={<Icons.BarChart />} 
            label={isSidebarOpen ? "Relatórios" : ""} 
            active={currentPage === 'reports'} 
            onClick={() => onPageChange('reports')} 
          />
        </nav>

        <div className="p-4 border-t border-gray-800">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="w-full flex items-center justify-center p-2 rounded-lg hover:bg-gray-800 text-gray-400"
          >
            {isSidebarOpen ? 'Recolher' : 'Exp.'}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b flex items-center justify-between px-8 shadow-sm">
          <h1 className="text-xl font-semibold text-gray-800">
            {currentPage === 'dashboard' && 'Visão Geral'}
            {currentPage === 'owners' && 'Gestão de Proprietários'}
            {currentPage === 'vehicles' && 'Gestão de Veículos'}
            {currentPage === 'services' && 'Ordens de Serviço'}
            {currentPage === 'reports' && 'Consolidação Financeira'}
          </h1>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-500">Administrador</span>
            <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center font-bold">A</div>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
