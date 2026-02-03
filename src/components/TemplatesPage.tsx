import { useState } from 'react';
import { 
  FileText, 
  Plus, 
  Edit2, 
  Eye, 
  Archive, 
  CheckCircle,
  Clock,
  ChevronRight
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { checklistTypeLabels } from '../types';
import { cn } from '../utils/cn';

export function TemplatesPage() {
  const { templates } = useApp();
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);

  const selectedTemplate = templates.find(t => t.id === selectedTemplateId);
  const currentVersion = selectedTemplate?.versions.find(v => v.id === selectedTemplate.currentVersionId);

  const statusIcons = {
    draft: Clock,
    published: CheckCircle,
    archived: Archive,
  };

  const statusLabels = {
    draft: 'Черновик',
    published: 'Опубликован',
    archived: 'Архив',
  };

  const statusColors = {
    draft: 'bg-yellow-100 text-yellow-700',
    published: 'bg-green-100 text-green-700',
    archived: 'bg-gray-100 text-gray-500',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Шаблоны чеклистов</h2>
          <p className="text-gray-500">Управление шаблонами и версиями</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <Plus className="h-5 w-5" />
          Новый шаблон
        </button>
      </div>

      {!selectedTemplateId ? (
        /* Template list */
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {templates.map(template => {
            const StatusIcon = statusIcons[template.status];
            const version = template.versions.find(v => v.id === template.currentVersionId);
            const itemCount = version?.sections.reduce((acc, s) => acc + s.items.length, 0) || 0;
            
            return (
              <div
                key={template.id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center">
                      <FileText className="h-6 w-6 text-blue-600" />
                    </div>
                    <span className={cn(
                      "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
                      statusColors[template.status]
                    )}>
                      <StatusIcon className="h-3 w-3" />
                      {statusLabels[template.status]}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{template.name}</h3>
                  <span className="inline-block px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs mb-2">
                    {checklistTypeLabels[template.type]}
                  </span>
                  <p className="text-sm text-gray-500 mb-4 line-clamp-2">{template.description}</p>
                  
                  <div className="flex items-center justify-between text-sm text-gray-400">
                    <span>v{version?.versionNumber || 1}</span>
                    <span>{itemCount} пунктов</span>
                    <span>{version?.sections.length || 0} секций</span>
                  </div>
                </div>
                
                <div className="border-t border-gray-100 p-3 bg-gray-50 flex gap-2">
                  <button
                    onClick={() => setSelectedTemplateId(template.id)}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Eye className="h-4 w-4" />
                    Просмотр
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                    <Edit2 className="h-4 w-4" />
                    Изменить
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Template detail */
        <div className="space-y-6">
          <button
            onClick={() => setSelectedTemplateId(null)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ChevronRight className="h-5 w-5 rotate-180" />
            Назад к списку
          </button>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            {/* Header */}
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-2xl font-bold text-gray-900">{selectedTemplate?.name}</h2>
                    <span className={cn(
                      "px-2 py-1 rounded-full text-sm font-medium",
                      statusColors[selectedTemplate?.status || 'draft']
                    )}>
                      {statusLabels[selectedTemplate?.status || 'draft']}
                    </span>
                  </div>
                  <span className="inline-block px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-sm">
                    {checklistTypeLabels[selectedTemplate?.type || 'daily']}
                  </span>
                  <p className="text-gray-500 mt-2">{selectedTemplate?.description}</p>
                </div>
                <div className="flex gap-2">
                  <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <Edit2 className="h-4 w-4" />
                    Редактировать
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    <Plus className="h-4 w-4" />
                    Новая версия
                  </button>
                </div>
              </div>
            </div>

            {/* Versions */}
            <div className="p-6 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-4">Версии</h3>
              <div className="flex gap-3 overflow-x-auto pb-2">
                {selectedTemplate?.versions.map(v => (
                  <div
                    key={v.id}
                    className={cn(
                      "flex-shrink-0 p-3 rounded-lg border-2 cursor-pointer transition-colors",
                      v.id === selectedTemplate.currentVersionId
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    )}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-gray-900">v{v.versionNumber}</span>
                      {v.id === selectedTemplate.currentVersionId && (
                        <span className="px-1.5 py-0.5 bg-blue-500 text-white rounded text-xs">
                          Активная
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">
                      {new Date(v.createdAt).toLocaleDateString('ru-RU')}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <h3 className="font-semibold text-gray-900 mb-4">
                Содержание (v{currentVersion?.versionNumber})
              </h3>
              <div className="space-y-6">
                {currentVersion?.sections.map((section, sIdx) => (
                  <div key={section.id} className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-gray-900">
                          {sIdx + 1}. {section.title}
                        </h4>
                        <span className="text-sm text-gray-500">
                          {section.items.length} пунктов
                        </span>
                      </div>
                    </div>
                    <div className="divide-y divide-gray-100">
                      {section.items.map((item, iIdx) => (
                        <div 
                          key={item.id}
                          className="px-4 py-3 flex items-start gap-3 hover:bg-gray-50"
                        >
                          <span className="text-sm text-gray-400 w-6">{sIdx + 1}.{iIdx + 1}</span>
                          <div className="flex-1">
                            <span className="text-gray-700">{item.text}</span>
                            {item.isRequired && (
                              <span className="ml-2 text-red-500 text-sm">*обязательный</span>
                            )}
                          </div>
                          <button className="p-1 text-gray-400 hover:text-gray-600 rounded">
                            <Edit2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
