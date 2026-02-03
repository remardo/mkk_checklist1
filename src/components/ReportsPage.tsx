import { useState } from 'react';
import { 
  BarChart3, 
  Download, 
  Calendar, 
  Building2,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Clock,
  FileText
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { statusLabels, checklistTypeLabels } from '../types';
import { cn } from '../utils/cn';

export function ReportsPage() {
  const { printJobs, getUserOffices, templates, currentUser, selectedOfficeId } = useApp();
  const [dateFrom, setDateFrom] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  });
  const [dateTo, setDateTo] = useState(() => new Date().toISOString().split('T')[0]);

  const userOffices = getUserOffices();
  
  // Filter jobs by date and office
  const filteredJobs = printJobs.filter(job => {
    const jobDate = new Date(job.checklistDate);
    const from = new Date(dateFrom);
    const to = new Date(dateTo);
    
    if (jobDate < from || jobDate > to) return false;
    if (selectedOfficeId && job.officeId !== selectedOfficeId) return false;
    if (!selectedOfficeId && !userOffices.find(o => o.id === job.officeId)) return false;
    
    return true;
  });

  // Calculate stats
  const stats = {
    total: filteredJobs.length,
    created: filteredJobs.filter(j => j.status === 'CREATED').length,
    approved: filteredJobs.filter(j => j.status === 'APPROVED').length,
    needReview: filteredJobs.filter(j => j.status === 'RECOGNIZED_NEED_REVIEW').length,
    autoOk: filteredJobs.filter(j => j.status === 'RECOGNIZED_AUTO_OK').length,
    errors: filteredJobs.filter(j => j.status === 'RECOGNIZED_ERROR').length,
    rejected: filteredJobs.filter(j => j.status === 'REJECTED').length,
  };

  const approvalRate = stats.total > 0 
    ? Math.round((stats.approved / stats.total) * 100) 
    : 0;

  const autoOkRate = (stats.autoOk + stats.approved) > 0
    ? Math.round((stats.autoOk / (stats.autoOk + stats.needReview)) * 100)
    : 0;

  // Stats by office
  const statsByOffice = userOffices.map(office => {
    const officeJobs = filteredJobs.filter(j => j.officeId === office.id);
    return {
      office,
      total: officeJobs.length,
      approved: officeJobs.filter(j => j.status === 'APPROVED').length,
      pending: officeJobs.filter(j => !['APPROVED', 'REJECTED'].includes(j.status)).length,
    };
  });

  // Stats by template
  const statsByTemplate = templates.map(template => {
    const templateJobs = filteredJobs.filter(j => j.templateId === template.id);
    return {
      template,
      total: templateJobs.length,
      approved: templateJobs.filter(j => j.status === 'APPROVED').length,
    };
  }).filter(s => s.total > 0);

  const handleExport = () => {
    // Generate CSV
    const headers = ['ID', 'Офис', 'Чеклист', 'Дата', 'Статус', 'Создал', 'Создан'];
    const rows = filteredJobs.map(job => {
      const office = userOffices.find(o => o.id === job.officeId);
      return [
        job.shortId,
        office?.name || '',
        job.templateName,
        new Date(job.checklistDate).toLocaleDateString('ru-RU'),
        statusLabels[job.status],
        job.createdByName,
        new Date(job.createdAt).toLocaleDateString('ru-RU'),
      ];
    });

    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `report_${dateFrom}_${dateTo}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="flex flex-col lg:flex-row gap-4 items-end">
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Calendar className="h-4 w-4 inline-block mr-1" />
                Дата с
              </label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Calendar className="h-4 w-4 inline-block mr-1" />
                Дата по
              </label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download className="h-5 w-5" />
            Экспорт CSV
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-sm text-gray-500">Всего экземпляров</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-green-100 flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-900">{stats.approved}</p>
              <p className="text-sm text-gray-500">Подтверждено</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-yellow-100 flex items-center justify-center">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-900">{stats.needReview}</p>
              <p className="text-sm text-gray-500">На проверке</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-red-100 flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="text-3xl font-bold text-gray-900">{stats.errors + stats.rejected}</p>
              <p className="text-sm text-gray-500">Ошибки/Отклонено</p>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Completion rate */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-gray-400" />
            Процент подтверждённых
          </h3>
          <div className="flex items-center gap-4">
            <div className="relative h-32 w-32">
              <svg className="h-32 w-32 -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="12"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  fill="none"
                  stroke="#22c55e"
                  strokeWidth="12"
                  strokeLinecap="round"
                  strokeDasharray={`${approvalRate * 3.52} 352`}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold text-gray-900">{approvalRate}%</span>
              </div>
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Подтверждено</span>
                <span className="font-medium text-gray-900">{stats.approved}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">В процессе</span>
                <span className="font-medium text-gray-900">
                  {stats.total - stats.approved - stats.rejected}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Отклонено</span>
                <span className="font-medium text-gray-900">{stats.rejected}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Auto recognition rate */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-gray-400" />
            Качество распознавания
          </h3>
          <div className="flex items-center gap-4">
            <div className="relative h-32 w-32">
              <svg className="h-32 w-32 -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="12"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="12"
                  strokeLinecap="round"
                  strokeDasharray={`${autoOkRate * 3.52} 352`}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold text-gray-900">{autoOkRate}%</span>
              </div>
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">AUTO_OK</span>
                <span className="font-medium text-gray-900">{stats.autoOk}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">NEED_REVIEW</span>
                <span className="font-medium text-gray-900">{stats.needReview}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">ERROR</span>
                <span className="font-medium text-gray-900">{stats.errors}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats by office */}
      {currentUser?.role === 'admin' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Building2 className="h-5 w-5 text-gray-400" />
              Статистика по офисам
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Офис</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">Всего</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">Подтверждено</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">В процессе</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">% выполнения</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {statsByOffice.map(({ office, total, approved, pending }) => (
                  <tr key={office.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-gray-400" />
                        <span className="font-medium text-gray-900">{office.name}</span>
                        <span className="text-xs text-gray-500">({office.code})</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-gray-700">{total}</td>
                    <td className="px-4 py-3 text-right text-sm text-green-600 font-medium">{approved}</td>
                    <td className="px-4 py-3 text-right text-sm text-yellow-600">{pending}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-green-500 rounded-full"
                            style={{ width: `${total > 0 ? (approved / total) * 100 : 0}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {total > 0 ? Math.round((approved / total) * 100) : 0}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Stats by template */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <FileText className="h-5 w-5 text-gray-400" />
            Статистика по типам чеклистов
          </h3>
        </div>
        <div className="p-4">
          {statsByTemplate.length > 0 ? (
            <div className="space-y-4">
              {statsByTemplate.map(({ template, total, approved }) => (
                <div key={template.id}>
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="font-medium text-gray-900">{template.name}</span>
                      <span className={cn(
                        "ml-2 px-2 py-0.5 rounded-full text-xs font-medium",
                        "bg-gray-100 text-gray-600"
                      )}>
                        {checklistTypeLabels[template.type]}
                      </span>
                    </div>
                    <span className="text-sm text-gray-600">
                      {approved} / {total}
                    </span>
                  </div>
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 rounded-full transition-all"
                      style={{ width: `${(approved / total) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <BarChart3 className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Нет данных за выбранный период</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
