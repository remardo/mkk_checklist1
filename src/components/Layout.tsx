import { useState } from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  Upload, 
  ClipboardList, 
  Building2, 
  Settings, 
  BarChart3,
  LogOut,
  Menu,
  X,
  ChevronDown,
  User
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { cn } from '../utils/cn';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
}

export function Layout({ children, currentPage, onNavigate }: LayoutProps) {
  const { currentUser, logout, getUserOffices, selectedOfficeId, setSelectedOfficeId, getOfficeById } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [officeDropdownOpen, setOfficeDropdownOpen] = useState(false);
  
  const userOffices = getUserOffices();
  const selectedOffice = selectedOfficeId ? getOfficeById(selectedOfficeId) : null;

  const menuItems = [
    { id: 'dashboard', label: 'Главная', icon: LayoutDashboard, roles: ['admin', 'manager', 'employee'] },
    { id: 'checklists', label: 'Чеклисты', icon: FileText, roles: ['admin', 'manager', 'employee'] },
    { id: 'upload', label: 'Загрузить скан', icon: Upload, roles: ['admin', 'manager', 'employee'] },
    { id: 'tracker', label: 'Таск-трекер', icon: ClipboardList, roles: ['admin', 'manager'] },
    { id: 'reports', label: 'Отчёты', icon: BarChart3, roles: ['admin', 'manager'] },
    { id: 'offices', label: 'Офисы', icon: Building2, roles: ['admin'] },
    { id: 'templates', label: 'Шаблоны', icon: Settings, roles: ['admin'] },
  ];

  const visibleMenuItems = menuItems.filter(item => 
    currentUser && item.roles.includes(currentUser.role)
  );

  const roleLabels = {
    admin: 'Администратор',
    manager: 'Менеджер',
    employee: 'Сотрудник',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed left-0 top-0 z-50 h-full w-64 bg-slate-900 text-white transition-transform duration-300",
        "lg:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex h-16 items-center justify-between px-4 border-b border-slate-700">
          <div className="flex items-center gap-2">
            <ClipboardList className="h-8 w-8 text-blue-400" />
            <span className="text-lg font-bold">Чеклисты</span>
          </div>
          <button 
            className="lg:hidden text-gray-400 hover:text-white"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Office selector */}
        <div className="p-4 border-b border-slate-700">
          <div className="relative">
            <button
              onClick={() => setOfficeDropdownOpen(!officeDropdownOpen)}
              className="w-full flex items-center justify-between px-3 py-2 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-gray-400" />
                <span className="text-sm truncate">
                  {selectedOffice ? selectedOffice.name : 'Выберите офис'}
                </span>
              </div>
              <ChevronDown className={cn("h-4 w-4 transition-transform", officeDropdownOpen && "rotate-180")} />
            </button>
            
            {officeDropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-slate-800 rounded-lg shadow-lg overflow-hidden z-10">
                {userOffices.map(office => (
                  <button
                    key={office.id}
                    onClick={() => {
                      setSelectedOfficeId(office.id);
                      setOfficeDropdownOpen(false);
                    }}
                    className={cn(
                      "w-full px-3 py-2 text-left text-sm hover:bg-slate-700 transition-colors",
                      selectedOfficeId === office.id && "bg-blue-600"
                    )}
                  >
                    {office.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {visibleMenuItems.map(item => (
            <button
              key={item.id}
              onClick={() => {
                onNavigate(item.id);
                setSidebarOpen(false);
              }}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                currentPage === item.id 
                  ? "bg-blue-600 text-white" 
                  : "text-gray-300 hover:bg-slate-800 hover:text-white"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </button>
          ))}
        </nav>

        {/* User info */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-700">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center">
              <User className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{currentUser?.name}</p>
              <p className="text-xs text-gray-400">{currentUser && roleLabels[currentUser.role]}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-slate-800 rounded-lg text-sm text-gray-300 hover:bg-slate-700 hover:text-white transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Выйти
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-30 h-16 bg-white border-b border-gray-200 flex items-center px-4 gap-4">
          <button 
            className="lg:hidden text-gray-600 hover:text-gray-900"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900">
            {visibleMenuItems.find(item => item.id === currentPage)?.label || 'Чеклисты'}
          </h1>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
