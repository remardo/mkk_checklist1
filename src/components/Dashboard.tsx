import { FileText, Upload, CheckCircle, AlertCircle, Clock, TrendingUp } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { statusLabels, statusColors } from '../types';
import { cn } from '../utils/cn';

interface DashboardProps {
  onNavigate: (page: string) => void;
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const { currentUser, printJobs, selectedOfficeId, getOfficeById } = useApp();
  
  const office = selectedOfficeId ? getOfficeById(selectedOfficeId) : null;
  
  // Filter jobs based on role and office
  const filteredJobs = printJobs.filter(job => {
    if (currentUser?.role === 'admin') {
      return selectedOfficeId ? job.officeId === selectedOfficeId : true;
    }
    if (currentUser?.role === 'manager') {
      return currentUser.officeIds.includes(job.officeId) && 
        (selectedOfficeId ? job.officeId === selectedOfficeId : true);
    }
    return job.createdBy === currentUser?.id && 
      (selectedOfficeId ? job.officeId === selectedOfficeId : true);
  });

  // Stats
  const stats = {
    total: filteredJobs.length,
    created: filteredJobs.filter(j => j.status === 'CREATED').length,
    needReview: filteredJobs.filter(j => j.status === 'RECOGNIZED_NEED_REVIEW').length,
    approved: filteredJobs.filter(j => j.status === 'APPROVED').length,
    errors: filteredJobs.filter(j => j.status === 'RECOGNIZED_ERROR').length,
  };

  const recentJobs = filteredJobs.slice(0, 5);

  const quickActions = [
    { id: 'checklists', label: 'Создать чеклист', icon: FileText, color: 'bg-blue-500 hover:bg-blue-600' },
    { id: 'upload', label: 'Загрузить скан', icon: Upload, color: 'bg-green-500 hover:bg-green-600' },
  ];

  if (currentUser?.role !== 'employee') {
    quickActions.push({ id: 'tracker', label: 'На проверку', icon: AlertCircle, color: 'bg-yellow-500 hover:bg-yellow-600' });
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 text-white">
        <h2 className="text-2xl font-bold mb-1">Добро пожаловать, {currentUser?.name}!</h2>
        <p className="text-blue-100">
          {office ? `Офис: ${office.name}` : 'Выберите офис для начала работы'}
        </p>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {quickActions.map(action => (
          <button
            key={action.id}
            onClick={() => onNavigate(action.id)}
            className={cn(
              "flex items-center gap-4 p-4 rounded-xl text-white transition-all shadow-lg",
              action.color
            )}
          >
            <action.icon className="h-8 w-8" />
            <span className="text-lg font-semibold">{action.label}</span>
          </button>
        ))}
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center">
              <FileText className="h-5 w-5 text-gray-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-sm text-gray-500">Всего</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Clock className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.created}</p>
              <p className="text-sm text-gray-500">Создано</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-yellow-100 flex items-center justify-center">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.needReview}</p>
              <p className="text-sm text-gray-500">На проверке</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.approved}</p>
              <p className="text-sm text-gray-500">Подтверждено</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-red-100 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.errors}</p>
              <p className="text-sm text-gray-500">Ошибки</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent jobs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Последние экземпляры</h3>
          <button 
            onClick={() => onNavigate('tracker')}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Смотреть все →
          </button>
        </div>
        
        {recentJobs.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {recentJobs.map(job => (
              <div key={job.id} className="p-4 flex items-center gap-4 hover:bg-gray-50">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-gray-900">{job.shortId}</span>
                    <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", statusColors[job.status])}>
                      {statusLabels[job.status]}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 truncate">{job.templateName}</p>
                  <p className="text-xs text-gray-400">{formatDate(job.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-gray-500">
            <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>Нет экземпляров чеклистов</p>
            <button 
              onClick={() => onNavigate('checklists')}
              className="mt-3 text-blue-600 hover:text-blue-700 font-medium"
            >
              Создать первый чеклист
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
