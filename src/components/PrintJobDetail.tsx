import { useState } from 'react';
import { 
  ChevronLeft, 
  Printer, 
  FileText, 
  Calendar, 
  User, 
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  History,
  FileImage,
  Check,
  X,
  MessageSquare
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useApp } from '../context/AppContext';
import { statusLabels, statusColors, type PrintJob, type RecognizedItem } from '../types';
import { cn } from '../utils/cn';

interface PrintJobDetailProps {
  job: PrintJob;
  onBack: () => void;
}

export function PrintJobDetail({ job, onBack }: PrintJobDetailProps) {
  const { 
    currentUser, 
    getTemplateById, 
    getOfficeById, 
    approvePrintJob, 
    rejectPrintJob,
    updateRecognitionItems
  } = useApp();
  
  const [activeTab, setActiveTab] = useState<'details' | 'recognition' | 'history'>('details');
  const [editedItems, setEditedItems] = useState<RecognizedItem[]>(
    job.recognitionResult?.items || []
  );
  const [comment, setComment] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const template = getTemplateById(job.templateId);
  const version = template?.versions.find(v => v.id === job.templateVersionId);
  const office = getOfficeById(job.officeId);
  
  const canReview = currentUser?.role !== 'employee' && 
    ['RECOGNIZED_NEED_REVIEW', 'RECOGNIZED_AUTO_OK'].includes(job.status);

  const formatDateTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleItemToggle = (itemId: string) => {
    setEditedItems(prev => prev.map(item => 
      item.itemId === itemId ? { ...item, isChecked: !item.isChecked } : item
    ));
  };

  const handleSaveChanges = () => {
    updateRecognitionItems(job.id, editedItems);
    setIsEditing(false);
  };

  const handleApprove = () => {
    approvePrintJob(job.id, comment || undefined);
  };

  const handleReject = () => {
    rejectPrintJob(job.id, comment || undefined);
  };

  const handlePrint = () => {
    window.print();
  };

  const qrData = JSON.stringify({
    printJobId: job.id,
    officeCode: office?.code,
    templateVersionId: job.templateVersionId,
    date: job.checklistDate,
  });

  const getItemText = (itemId: string): string => {
    for (const section of version?.sections || []) {
      const item = section.items.find(i => i.id === itemId);
      if (item) return item.text;
    }
    return 'Неизвестный пункт';
  };

  const actionLabels: Record<string, string> = {
    created: 'Создан',
    printed: 'Распечатан',
    reprinted: 'Перепечатан',
    scan_uploaded: 'Скан загружен',
    recognized: 'Распознан',
    manually_corrected: 'Исправлен вручную',
    approved: 'Подтверждён',
    rejected: 'Отклонён',
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ChevronLeft className="h-5 w-5" />
          Назад к списку
        </button>
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors print:hidden"
        >
          <Printer className="h-5 w-5" />
          Печать
        </button>
      </div>

      {/* Main card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Card header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-gray-900">{job.shortId}</h1>
                <span className={cn("px-3 py-1 rounded-full text-sm font-medium", statusColors[job.status])}>
                  {statusLabels[job.status]}
                </span>
              </div>
              <p className="text-lg text-gray-600 mb-4">{job.templateName}</p>
              
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Дата чеклиста</p>
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(job.checklistDate).toLocaleDateString('ru-RU')}
                      {job.shift && ` (${job.shift === 'morning' ? 'утро' : 'вечер'})`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Создал</p>
                    <p className="text-sm font-medium text-gray-900">{job.createdByName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Создан</p>
                    <p className="text-sm font-medium text-gray-900">{formatDateTime(job.createdAt)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Версия</p>
                    <p className="text-sm font-medium text-gray-900">v{version?.versionNumber || 1}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex-shrink-0">
              <QRCodeSVG value={qrData} size={100} />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-100">
          <div className="flex">
            <button
              onClick={() => setActiveTab('details')}
              className={cn(
                "px-6 py-3 text-sm font-medium border-b-2 transition-colors",
                activeTab === 'details'
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              )}
            >
              Детали
            </button>
            <button
              onClick={() => setActiveTab('recognition')}
              className={cn(
                "px-6 py-3 text-sm font-medium border-b-2 transition-colors",
                activeTab === 'recognition'
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              )}
            >
              Распознавание
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={cn(
                "px-6 py-3 text-sm font-medium border-b-2 transition-colors",
                activeTab === 'history'
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              )}
            >
              <History className="h-4 w-4 inline-block mr-1" />
              История
            </button>
          </div>
        </div>

        {/* Tab content */}
        <div className="p-6">
          {/* Details tab */}
          {activeTab === 'details' && (
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Checklist content */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Содержание чеклиста</h3>
                {version?.sections.map(section => (
                  <div key={section.id} className="mb-4">
                    <h4 className="font-medium text-gray-700 mb-2">{section.title}</h4>
                    <ul className="space-y-1 text-sm text-gray-600">
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

              {/* Scan preview */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Скан</h3>
                {job.scan ? (
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <FileImage className="h-8 w-8 text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900">{job.scan.fileName}</p>
                        <p className="text-sm text-gray-500">
                          Загружен: {formatDateTime(job.scan.uploadedAt)}
                        </p>
                      </div>
                    </div>
                    <div className="bg-gray-100 rounded-lg h-48 flex items-center justify-center">
                      <p className="text-gray-400">Превью скана</p>
                    </div>
                  </div>
                ) : (
                  <div className="border border-gray-200 rounded-lg p-8 text-center">
                    <FileImage className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">Скан ещё не загружен</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Recognition tab */}
          {activeTab === 'recognition' && (
            <div>
              {job.recognitionResult ? (
                <>
                  {/* Status banner */}
                  <div className={cn(
                    "rounded-lg p-4 mb-6 flex items-start gap-3",
                    job.recognitionResult.status === 'AUTO_OK' && "bg-green-50 border border-green-200",
                    job.recognitionResult.status === 'NEED_REVIEW' && "bg-yellow-50 border border-yellow-200",
                    job.recognitionResult.status === 'ERROR' && "bg-red-50 border border-red-200"
                  )}>
                    {job.recognitionResult.status === 'AUTO_OK' && (
                      <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                    )}
                    {job.recognitionResult.status === 'NEED_REVIEW' && (
                      <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0" />
                    )}
                    {job.recognitionResult.status === 'ERROR' && (
                      <XCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                    )}
                    <div>
                      <p className={cn(
                        "font-medium",
                        job.recognitionResult.status === 'AUTO_OK' && "text-green-800",
                        job.recognitionResult.status === 'NEED_REVIEW' && "text-yellow-800",
                        job.recognitionResult.status === 'ERROR' && "text-red-800"
                      )}>
                        {job.recognitionResult.status === 'AUTO_OK' && 'Распознано успешно'}
                        {job.recognitionResult.status === 'NEED_REVIEW' && 'Требуется проверка'}
                        {job.recognitionResult.status === 'ERROR' && 'Ошибка распознавания'}
                      </p>
                      {job.recognitionResult.errorReason && (
                        <p className="text-sm text-red-600 mt-1">{job.recognitionResult.errorReason}</p>
                      )}
                    </div>
                  </div>

                  {/* Items list */}
                  {job.recognitionResult.items.length > 0 && (
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-gray-900">Распознанные пункты</h3>
                        {canReview && !isEditing && (
                          <button
                            onClick={() => setIsEditing(true)}
                            className="text-sm text-blue-600 hover:text-blue-700"
                          >
                            Редактировать
                          </button>
                        )}
                        {isEditing && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setEditedItems(job.recognitionResult?.items || []);
                                setIsEditing(false);
                              }}
                              className="text-sm text-gray-600 hover:text-gray-700"
                            >
                              Отмена
                            </button>
                            <button
                              onClick={handleSaveChanges}
                              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                            >
                              Сохранить
                            </button>
                          </div>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        {editedItems.map(item => (
                          <div 
                            key={item.itemId}
                            className={cn(
                              "flex items-center gap-3 p-3 rounded-lg border",
                              item.confidence < 70 && "bg-yellow-50 border-yellow-200",
                              item.confidence >= 70 && "border-gray-200"
                            )}
                          >
                            {isEditing ? (
                              <button
                                onClick={() => handleItemToggle(item.itemId)}
                                className={cn(
                                  "flex-shrink-0 h-6 w-6 rounded border-2 flex items-center justify-center transition-colors",
                                  item.isChecked
                                    ? "bg-green-500 border-green-500"
                                    : "border-gray-300 hover:border-gray-400"
                                )}
                              >
                                {item.isChecked && <Check className="h-4 w-4 text-white" />}
                              </button>
                            ) : (
                              <div className={cn(
                                "flex-shrink-0 h-6 w-6 rounded flex items-center justify-center",
                                item.isChecked ? "bg-green-100" : "bg-gray-100"
                              )}>
                                {item.isChecked ? (
                                  <Check className="h-4 w-4 text-green-600" />
                                ) : (
                                  <X className="h-4 w-4 text-gray-400" />
                                )}
                              </div>
                            )}
                            <span className="flex-1 text-sm text-gray-700">
                              {getItemText(item.itemId)}
                            </span>
                            <span className={cn(
                              "text-xs font-medium px-2 py-1 rounded-full",
                              item.confidence >= 90 && "bg-green-100 text-green-700",
                              item.confidence >= 70 && item.confidence < 90 && "bg-blue-100 text-blue-700",
                              item.confidence < 70 && "bg-yellow-100 text-yellow-700"
                            )}>
                              {item.confidence}%
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Approval actions */}
                  {canReview && job.status !== 'APPROVED' && job.status !== 'REJECTED' && (
                    <div className="border-t border-gray-200 pt-6">
                      <h3 className="font-semibold text-gray-900 mb-4">Подтверждение</h3>
                      
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <MessageSquare className="h-4 w-4 inline-block mr-1" />
                          Комментарий (опционально)
                        </label>
                        <textarea
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          placeholder="Добавьте комментарий..."
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          rows={2}
                        />
                      </div>

                      <div className="flex gap-3">
                        <button
                          onClick={handleApprove}
                          className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                          <CheckCircle className="h-5 w-5" />
                          Подтвердить
                        </button>
                        <button
                          onClick={handleReject}
                          className="flex items-center gap-2 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                          <XCircle className="h-5 w-5" />
                          Отклонить
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Confirmation info */}
                  {job.recognitionResult.confirmedBy && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600">
                        <strong>{job.status === 'APPROVED' ? 'Подтверждено' : 'Отклонено'}:</strong>{' '}
                        {formatDateTime(job.recognitionResult.confirmedAt || '')}
                      </p>
                      {job.recognitionResult.comment && (
                        <p className="text-sm text-gray-600 mt-1">
                          <strong>Комментарий:</strong> {job.recognitionResult.comment}
                        </p>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-8">
                  <AlertCircle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">Скан ещё не обработан</p>
                  <p className="text-sm text-gray-400">Загрузите скан для распознавания</p>
                </div>
              )}
            </div>
          )}

          {/* History tab */}
          {activeTab === 'history' && (
            <div>
              <div className="space-y-4">
                {job.history.map((event, index) => (
                  <div key={event.id} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={cn(
                        "h-8 w-8 rounded-full flex items-center justify-center",
                        event.action === 'approved' && "bg-green-100",
                        event.action === 'rejected' && "bg-red-100",
                        !['approved', 'rejected'].includes(event.action) && "bg-blue-100"
                      )}>
                        {event.action === 'approved' && <CheckCircle className="h-4 w-4 text-green-600" />}
                        {event.action === 'rejected' && <XCircle className="h-4 w-4 text-red-600" />}
                        {event.action === 'created' && <FileText className="h-4 w-4 text-blue-600" />}
                        {event.action === 'scan_uploaded' && <FileImage className="h-4 w-4 text-blue-600" />}
                        {event.action === 'recognized' && <Check className="h-4 w-4 text-blue-600" />}
                        {event.action === 'manually_corrected' && <User className="h-4 w-4 text-blue-600" />}
                      </div>
                      {index < job.history.length - 1 && (
                        <div className="w-px h-full bg-gray-200 mt-2" />
                      )}
                    </div>
                    <div className="pb-4">
                      <p className="font-medium text-gray-900">{actionLabels[event.action] || event.action}</p>
                      <p className="text-sm text-gray-600">{event.details}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {event.userName} • {formatDateTime(event.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
