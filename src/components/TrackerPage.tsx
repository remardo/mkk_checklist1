import { useState } from 'react';
import { 
  Filter, 
  Search, 
  FileText, 
  Calendar, 
  LayoutGrid, 
  List,
  ChevronDown,
  Eye
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { statusLabels, statusColors, checklistTypeLabels, type PrintJobStatus } from '../types';
import { cn } from '../utils/cn';
import { PrintJobDetail } from './PrintJobDetail';

type ViewMode = 'table' | 'kanban';

const statusOrder: PrintJobStatus[] = [
  'CREATED',
  'SCAN_RECEIVED',
  'RECOGNIZED_NEED_REVIEW',
  'RECOGNIZED_AUTO_OK',
  'RECOGNIZED_ERROR',
  'APPROVED',
  'REJECTED',
];

export function TrackerPage() {
  const { printJobs, currentUser, selectedOfficeId, templates, getUserOffices } = useApp();
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<PrintJobStatus | 'all'>('all');
  const [templateFilter, setTemplateFilter] = useState<string>('all');
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const userOffices = getUserOffices();

  // Filter jobs
  const filteredJobs = printJobs.filter(job => {
    // Office filter
    if (selectedOfficeId && job.officeId !== selectedOfficeId) return false;
    if (!selectedOfficeId && !userOffices.find(o => o.id === job.officeId)) return false;
    
    // Role-based filter
    if (currentUser?.role === 'employee' && job.createdBy !== currentUser.id) return false;
    
    // Search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (
        !job.shortId.toLowerCase().includes(query) &&
        !job.templateName.toLowerCase().includes(query) &&
        !job.createdByName.toLowerCase().includes(query)
      ) {
        return false;
      }
    }
    
    // Status filter
    if (statusFilter !== 'all' && job.status !== statusFilter) return false;
    
    // Template filter
    if (templateFilter !== 'all' && job.templateId !== templateFilter) return false;
    
    return true;
  }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const selectedJob = selectedJobId ? printJobs.find(j => j.id === selectedJobId) : null;

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatDateTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Group jobs by status for kanban
  const jobsByStatus = statusOrder.reduce((acc, status) => {
    acc[status] = filteredJobs.filter(j => j.status === status);
    return acc;
  }, {} as Record<PrintJobStatus, typeof filteredJobs>);

  if (selectedJob) {
    return (
      <PrintJobDetail 
        job={selectedJob} 
        onBack={() => setSelectedJobId(null)} 
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Поиск по ID, названию, сотруднику..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* View mode toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors",
                showFilters
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-gray-200 text-gray-600 hover:border-gray-300"
              )}
            >
              <Filter className="h-4 w-4" />
              Фильтры
              <ChevronDown className={cn("h-4 w-4 transition-transform", showFilters && "rotate-180")} />
            </button>

            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('table')}
                className={cn(
                  "p-2 rounded-md transition-colors",
                  viewMode === 'table' ? "bg-white shadow-sm" : "text-gray-500 hover:text-gray-700"
                )}
              >
                <List className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode('kanban')}
                className={cn(
                  "p-2 rounded-md transition-colors",
                  viewMode === 'kanban' ? "bg-white shadow-sm" : "text-gray-500 hover:text-gray-700"
                )}
              >
                <LayoutGrid className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Expanded filters */}
        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4 pt-4 border-t border-gray-100">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Статус</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as PrintJobStatus | 'all')}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Все статусы</option>
                {statusOrder.map(status => (
                  <option key={status} value={status}>{statusLabels[status]}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Тип чеклиста</label>
              <select
                value={templateFilter}
                onChange={(e) => setTemplateFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Все типы</option>
                {templates.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({checklistTypeLabels[t.type]})
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Results count */}
      <div className="text-sm text-gray-500">
        Найдено: {filteredJobs.length} экземпляров
      </div>

      {/* Table view */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">ID</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Чеклист</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Дата</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Создал</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Статус</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Создан</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredJobs.map(job => (
                  <tr key={job.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <span className="font-mono text-sm font-medium text-gray-900">{job.shortId}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-700">{job.templateName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-700">{formatDate(job.checklistDate)}</span>
                        {job.shift && (
                          <span className="text-xs text-gray-500">
                            ({job.shift === 'morning' ? 'утро' : 'вечер'})
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-700">{job.createdByName}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn("px-2 py-1 rounded-full text-xs font-medium", statusColors[job.status])}>
                        {statusLabels[job.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-500">{formatDateTime(job.createdAt)}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setSelectedJobId(job.id)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Eye className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredJobs.length === 0 && (
            <div className="p-8 text-center">
              <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p className="text-gray-500">Нет экземпляров по заданным фильтрам</p>
            </div>
          )}
        </div>
      )}

      {/* Kanban view */}
      {viewMode === 'kanban' && (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {statusOrder.map(status => (
            <div key={status} className="flex-shrink-0 w-72">
              <div className={cn(
                "rounded-t-xl px-4 py-2 font-medium text-sm",
                statusColors[status]
              )}>
                {statusLabels[status]} ({jobsByStatus[status].length})
              </div>
              <div className="bg-gray-100 rounded-b-xl p-2 min-h-[200px] space-y-2">
                {jobsByStatus[status].map(job => (
                  <button
                    key={job.id}
                    onClick={() => setSelectedJobId(job.id)}
                    className="w-full bg-white rounded-lg p-3 shadow-sm border border-gray-200 hover:border-blue-500 hover:shadow-md transition-all text-left"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-sm font-medium text-gray-900">{job.shortId}</span>
                    </div>
                    <p className="text-sm text-gray-700 mb-1 truncate">{job.templateName}</p>
                    <p className="text-xs text-gray-500">{formatDate(job.checklistDate)}</p>
                    <p className="text-xs text-gray-400 mt-1">{job.createdByName}</p>
                  </button>
                ))}
                {jobsByStatus[status].length === 0 && (
                  <div className="text-center text-gray-400 text-sm py-8">
                    Пусто
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
