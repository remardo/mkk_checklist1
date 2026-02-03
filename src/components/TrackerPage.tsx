import { useState } from 'react';
import { 
  Filter, 
  Search, 
  FileText, 
  Calendar, 
  LayoutGrid, 
  List,
  ChevronDown,
  Eye,
  Edit3
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { statusLabels, statusColors, checklistTypeLabels, type PrintJobStatus } from '../types';
import { cn } from '../utils/cn';
import { PrintJobDetail } from './PrintJobDetail';
import { RecognitionEditor } from './RecognitionEditor';

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
  const { printJobs, currentUser, selectedOfficeId, templates, getUserOffices, getTemplateById } = useApp();
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showRecognitionEditor, setShowRecognitionEditor] = useState<string | null>(null);

  const selectedOffice = selectedOfficeId ? getUserOffices().find(o => o.id === selectedOfficeId) : null;
  
  // Filter jobs for current office
  const officeJobs = printJobs.filter(job => job.officeId === selectedOfficeId);

  // Apply filters
  const filteredJobs = officeJobs.filter(job => {
    const matchesSearch = job.shortId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.templateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.createdByName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || job.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const sortedJobs = filteredJobs.sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const handleRecognitionEdit = (printJobId: string) => {
    const printJob = printJobs.find(job => job.id === printJobId);
    const template = getTemplateById(printJob?.templateId || '');
    if (printJob && template && printJob.recognitionResult) {
      setShowRecognitionEditor(printJobId);
    }
  };

  const closeRecognitionEditor = () => {
    setShowRecognitionEditor(null);
  };

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

  if (!selectedOfficeId) {
    return (
      <div className="bg-white rounded-xl p-8 text-center shadow-sm border border-gray-100">
        <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
        <p className="text-gray-500">Выберите офис для просмотра экземпляров</p>
      </div>
    );
  }

  if (selectedJob) {
    return (
      <PrintJobDetail
        job={selectedJob}
        template={templates.find(t => t.id === selectedJob.templateId)}
        office={selectedOffice}
        onClose={() => setSelectedJobId(null)}
        onRecognitionEdit={handleRecognitionEdit}
      />
    );
  }

  // Add recognition editor modal
  if (showRecognitionEditor) {
    return (
      <RecognitionEditor
        printJob={printJobs.find(job => job.id === showRecognitionEditor)!}
        template={getTemplateById(printJobs.find(job => job.id === showRecognitionEditor)?.templateId || '')}
        onClose={closeRecognitionEditor}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Трекер экземпляров</h2>
          <p className="text-gray-500">
            Офис: {selectedOffice?.name} • Всего: {filteredJobs.length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Поиск по ID, шаблону или автору..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Status filter */}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Все статусы</option>
              {statusOrder.map(status => (
                <option key={status} value={status}>
                  {statusLabels[status]} ({jobsByStatus[status].length})
                </option>
              ))}
            </select>
          </div>

          {/* View mode toggle */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('table')}
              className={cn(
                "px-3 py-1.5 rounded text-sm font-medium transition-colors",
                viewMode === 'table' ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"
              )}
            >
              <List className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={cn(
                "px-3 py-1.5 rounded text-sm font-medium transition-colors",
                viewMode === 'kanban' ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"
              )}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
          </div>
        </div>
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
                {sortedJobs.map(job => {
                  const needsRecognition = job.status === 'RECOGNIZED_NEED_REVIEW' || job.status === 'RECOGNIZED_AUTO_OK';
                  const hasRecognitionResult = !!job.recognitionResult;
                  
                  return (
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
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setSelectedJobId(job.id)}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Eye className="h-5 w-5" />
                          </button>
                          {hasRecognitionResult && job.recognitionResult && (
                            <button
                              onClick={() => handleRecognitionEdit(job.id)}
                              className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                            >
                              <Edit3 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
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
                      {job.recognitionResult && ['RECOGNIZED_NEED_REVIEW', 'RECOGNIZED_AUTO_OK'].includes(job.status) && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRecognitionEdit(job.id);
                          }}
                          className="p-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
                        >
                          <Edit3 className="h-3 w-3" />
                        </button>
                      )}
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