import { useState } from 'react';
import { ClipboardList, Building2, User, Shield, Users } from 'lucide-react';
import { mockUsers } from '../data/mockData';
import { useApp } from '../context/AppContext';
import { cn } from '../utils/cn';

export function LoginPage() {
  const { login } = useApp();
  const [selectedRole, setSelectedRole] = useState<'admin' | 'manager' | 'employee' | null>(null);

  const roleCards = [
    { role: 'admin' as const, label: 'Администратор', icon: Shield, desc: 'Полный доступ ко всем функциям', color: 'bg-purple-500' },
    { role: 'manager' as const, label: 'Менеджер', icon: Users, desc: 'Управление чеклистами офиса', color: 'bg-blue-500' },
    { role: 'employee' as const, label: 'Сотрудник', icon: User, desc: 'Печать и загрузка сканов', color: 'bg-green-500' },
  ];

  const filteredUsers = selectedRole 
    ? mockUsers.filter(u => u.role === selectedRole)
    : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-blue-600 shadow-lg shadow-blue-500/30 mb-4">
            <ClipboardList className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Сервис чеклистов</h1>
          <p className="text-gray-400">Выберите роль для входа (демо-режим)</p>
        </div>

        {/* Role selection */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          {!selectedRole ? (
            <>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Building2 className="h-5 w-5 text-gray-500" />
                Выберите роль
              </h2>
              <div className="space-y-3">
                {roleCards.map(({ role, label, icon: Icon, desc, color }) => (
                  <button
                    key={role}
                    onClick={() => setSelectedRole(role)}
                    className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-gray-100 hover:border-blue-500 hover:bg-blue-50 transition-all group"
                  >
                    <div className={cn("h-12 w-12 rounded-xl flex items-center justify-center", color)}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="text-left flex-1">
                      <p className="font-semibold text-gray-900 group-hover:text-blue-600">{label}</p>
                      <p className="text-sm text-gray-500">{desc}</p>
                    </div>
                    <svg className="h-5 w-5 text-gray-300 group-hover:text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <>
              <button 
                onClick={() => setSelectedRole(null)}
                className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-4"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Назад к выбору роли
              </button>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Выберите пользователя ({roleCards.find(r => r.role === selectedRole)?.label})
              </h2>
              <div className="space-y-2">
                {filteredUsers.map(user => (
                  <button
                    key={user.id}
                    onClick={() => login(user.id)}
                    className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-gray-100 hover:border-blue-500 hover:bg-blue-50 transition-all group"
                  >
                    <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center group-hover:bg-blue-100">
                      <User className="h-5 w-5 text-gray-600 group-hover:text-blue-600" />
                    </div>
                    <div className="text-left flex-1">
                      <p className="font-medium text-gray-900 group-hover:text-blue-600">{user.name}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        <p className="text-center text-gray-500 text-sm mt-6">
          В реальной системе вход осуществляется через SSO
        </p>
      </div>
    </div>
  );
}
