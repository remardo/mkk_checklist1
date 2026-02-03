import { useState } from 'react';
import { FileText, Printer, Calendar, Clock, ChevronRight } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useApp } from '../context/AppContext';
import { checklistTypeLabels } from '../types';
import { cn } from '../utils/cn';

export function ChecklistsPage() {
  const { templates, selectedOfficeId, getOfficeById, createPrintJob, currentUser } = useApp();
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [generatedJob, setGeneratedJob] = useState<{
    id: string;
    shortId: string;
    templateName: string;
    officeName: string;
    date: string;
    version: number;
  } | null>(null);
  const [checklistDate, setChecklistDate] = useState(new Date().toISOString().split('T')[0]);
  const [shift, setShift] = useState<'morning' | 'evening'>('morning');

  const office = selectedOfficeId ? getOfficeById(selectedOfficeId) : null;
  
  // Get templates available for selected office
  const availableTemplates = templates.filter(t => 
    t.status === 'published' && 
    (!office || office.templateIds.includes(t.id))
  );

  const selectedTemplateData = templates.find(t => t.id === selectedTemplate);
  const templateVersion = selectedTemplateData?.versions.find(v => v.id === selectedTemplateData.currentVersionId);

  const handleGeneratePDF = () => {
    if (!selectedTemplate || !selectedOfficeId) return;
    
    const job = createPrintJob(selectedTemplate, selectedOfficeId, checklistDate, shift);
    const template = templates.find(t => t.id === selectedTemplate);
    const version = template?.versions.find(v => v.id === template.currentVersionId);
    
    setGeneratedJob({
      id: job.id,
      shortId: job.shortId,
      templateName: template?.name || '',
      officeName: office?.name || '',
      date: checklistDate,
      version: version?.versionNumber || 1,
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const handleBack = () => {
    setGeneratedJob(null);
    setSelectedTemplate(null);
  };

  if (!selectedOfficeId) {
    return (
      <div className="bg-white rounded-xl p-8 text-center shadow-sm border border-gray-100">
        <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
        <p className="text-gray-500">Выберите офис в боковом меню для просмотра чеклистов</p>
      </div>
    );
  }

  // Print preview mode
  if (generatedJob) {
    const qrData = JSON.stringify({
      printJobId: generatedJob.id,
      officeCode: office?.code,
      templateVersionId: templateVersion?.id,
      date: generatedJob.date,
    });

    return (
      <div className="space-y-4">
        {/* Print controls - hidden when printing */}
        <div className="print:hidden flex items-center justify-between bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ChevronRight className="h-5 w-5 rotate-180" />
            Назад к списку
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Printer className="h-5 w-5" />
            Печать
          </button>
        </div>

        {/* Printable checklist */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 print:shadow-none print:border-none print:p-0">
          {/* Header */}
          <div className="flex items-start justify-between mb-6 pb-4 border-b-2 border-gray-900">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{generatedJob.templateName}</h1>
              <div className="mt-2 space-y-1 text-sm text-gray-600">
                <p><strong>Офис:</strong> {generatedJob.officeName} ({office?.code})</p>
                <p><strong>Дата:</strong> {new Date(generatedJob.date).toLocaleDateString('ru-RU')}</p>
                <p><strong>Смена:</strong> {shift === 'morning' ? 'Утренняя' : 'Вечерняя'}</p>
                <p><strong>Версия:</strong> v{generatedJob.version}</p>
                <p><strong>ID:</strong> {generatedJob.shortId}</p>
              </div>
            </div>
            <div className="text-center">
              <QRCodeSVG value={qrData} size={100} />
              <p className="text-xs text-gray-500 mt-1">{generatedJob.shortId}</p>
            </div>
          </div>

          {/* Sections and items */}
          {templateVersion?.sections.map(section => (
            <div key={section.id} className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3 pb-1 border-b border-gray-300">
                {section.title}
              </h2>
              <div className="space-y-2">
                {section.items.map(item => (
                  <div 
                    key={item.id} 
                    className="flex items-start gap-3 py-2"
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      <div className="w-5 h-5 border-2 border-gray-900 rounded" />
                    </div>
                    <span className={cn(
                      "text-gray-700",
                      item.isRequired && "font-medium"
                    )}>
                      {item.text}
                      {item.isRequired && <span className="text-red-600 ml-1">*</span>}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Footer */}
          <div className="mt-8 pt-4 border-t-2 border-gray-900">
            <div className="flex justify-between items-end">
              <div>
                <p className="text-sm text-gray-600 mb-4">Заполнил: _________________________</p>
                <p className="text-sm text-gray-600">Подпись: _________________________</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Дата/Время: _________________________</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Template selection */}
      {!selectedTemplate ? (
        <>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <p className="text-gray-600">
              <span className="font-medium text-gray-900">Офис:</span> {office?.name}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {availableTemplates.map(template => (
              <button
                key={template.id}
                onClick={() => setSelectedTemplate(template.id)}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 text-left hover:border-blue-500 hover:shadow-md transition-all group"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center group-hover:bg-blue-500 transition-colors">
                    <FileText className="h-6 w-6 text-blue-600 group-hover:text-white transition-colors" />
                  </div>
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                    {checklistTypeLabels[template.type]}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">{template.name}</h3>
                <p className="text-sm text-gray-500 mb-3">{template.description}</p>
                <p className="text-xs text-gray-400">
                  Версия: v{template.versions.find(v => v.id === template.currentVersionId)?.versionNumber || 1}
                </p>
              </button>
            ))}
          </div>

          {availableTemplates.length === 0 && (
            <div className="bg-white rounded-xl p-8 text-center shadow-sm border border-gray-100">
              <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p className="text-gray-500">Нет доступных чеклистов для этого офиса</p>
            </div>
          )}
        </>
      ) : (
        <>
          {/* Date and shift selection */}
          <button
            onClick={() => setSelectedTemplate(null)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ChevronRight className="h-5 w-5 rotate-180" />
            Назад к списку чеклистов
          </button>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">{selectedTemplateData?.name}</h2>
            <p className="text-gray-500 mb-6">{selectedTemplateData?.description}</p>

            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="h-4 w-4 inline-block mr-1" />
                  Дата чеклиста
                </label>
                <input
                  type="date"
                  value={checklistDate}
                  onChange={(e) => setChecklistDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock className="h-4 w-4 inline-block mr-1" />
                  Смена
                </label>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShift('morning')}
                    className={cn(
                      "flex-1 px-4 py-2 rounded-lg border-2 font-medium transition-colors",
                      shift === 'morning'
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-gray-200 text-gray-600 hover:border-gray-300"
                    )}
                  >
                    Утренняя
                  </button>
                  <button
                    onClick={() => setShift('evening')}
                    className={cn(
                      "flex-1 px-4 py-2 rounded-lg border-2 font-medium transition-colors",
                      shift === 'evening'
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-gray-200 text-gray-600 hover:border-gray-300"
                    )}
                  >
                    Вечерняя
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={handleGeneratePDF}
                disabled={!currentUser}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FileText className="h-5 w-5" />
                Сформировать PDF
              </button>
            </div>
          </div>

          {/* Preview of checklist content */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-4">Содержание чеклиста</h3>
            {templateVersion?.sections.map(section => (
              <div key={section.id} className="mb-4">
                <h4 className="font-medium text-gray-700 mb-2">{section.title}</h4>
                <ul className="space-y-1 text-sm text-gray-600 pl-4">
                  {section.items.map(item => (
                    <li key={item.id} className="flex items-start gap-2">
                      <span className="text-gray-400">•</span>
                      <span>
                        {item.text}
                        {item.isRequired && <span className="text-red-500 ml-1">*</span>}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
