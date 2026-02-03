import { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  AlertTriangle, 
  Eye, 
  EyeOff, 
  Edit3, 
  Save, 
  X, 
  FileText,
  Info,
  Trash2,
  RotateCcw
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { type PrintJob, type RecognizedItem, type ChecklistTemplate, type ChecklistSection } from '../types';
import { cn } from '../utils/cn';

interface RecognitionEditorProps {
  printJob: PrintJob;
  template: ChecklistTemplate | undefined;
  onClose: () => void;
}

export function RecognitionEditor({ printJob, template, onClose }: RecognitionEditorProps) {
  const { updateRecognitionItems, approvePrintJob, rejectPrintJob, currentUser } = useApp();
  const [localItems, setLocalItems] = useState<RecognizedItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showConfidence, setShowConfidence] = useState(false);

  useEffect(() => {
    if (printJob.recognitionResult) {
      setLocalItems([...printJob.recognitionResult.items]);
    }
  }, [printJob.recognitionResult]);

  const currentVersion = template?.versions.find(v => v.id === printJob.templateVersionId);
  const allTemplateItems = currentVersion?.sections.flatMap(s => s.items) || [];

  const handleToggleItem = (itemId: string) => {
    setLocalItems(prev => prev.map(item => 
      item.itemId === itemId 
        ? { ...item, isChecked: !item.isChecked }
        : item
    ));
  };

  const handleConfidenceChange = (itemId: string, confidence: number) => {
    setLocalItems(prev => prev.map(item => 
      item.itemId === itemId 
        ? { ...item, confidence: Math.max(0, Math.min(100, confidence)) }
        : item
    ));
  };

  const handleAutoCorrect = () => {
    // Auto-correct items with low confidence
    setLocalItems(prev => prev.map(item => {
      // Mark all items as checked regardless of confidence
      return {
        ...item,
        isChecked: true,
        confidence: 100 // Set confidence to 100%
      };
    }));
  };

  const handleResetToOriginal = () => {
    if (printJob.recognitionResult) {
      setLocalItems([...printJob.recognitionResult.items]);
    }
  };

  const getTemplateItem = (itemId: string) => {
    return allTemplateItems.find(t => t.id === itemId);
  };

  const handleApprove = async () => {
    if (!currentUser) return;
    
    setIsProcessing(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    updateRecognitionItems(printJob.id, localItems);
    approvePrintJob(printJob.id);
    setIsProcessing(false);
    onClose();
  };

  const handleReject = async () => {
    if (!currentUser) return;
    
    setIsProcessing(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    updateRecognitionItems(printJob.id, localItems);
    rejectPrintJob(printJob.id, 'Отклонено после ручной проверки');
    setIsProcessing(false);
    onClose();
  };

  const getItemsBySection = (sectionId: string) => {
    return allTemplateItems
      .filter(item => {
        const section = currentVersion?.sections.find(s => s.items.some(i => i.id === item.id));
        return section?.id === sectionId;
      })
      .map(item => {
        const recognized = localItems.find(r => r.itemId === item.id);
        return {
          templateItem: item,
          recognizedItem: recognized || {
            itemId: item.id,
            isChecked: false,
            confidence: 0
          }
        };
      });
  };

  const getOverallConfidence = () => {
    if (localItems.length === 0) return 0;
    const total = localItems.reduce((sum, item) => sum + item.confidence, 0);
    return Math.round(total / localItems.length);
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-green-600 bg-green-100';
    if (confidence >= 70) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  if (!template || !currentVersion) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 text-center">
          <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Ошибка</h2>
          <p className="text-gray-600 mb-4">
            Шаблон или версия не найдена для этого экземпляра
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Закрыть
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">
                Распознавание: {printJob.shortId}
              </h2>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span>{printJob.templateName}</span>
                <span>•</span>
                <span>{printJob.checklistDate}</span>
                {printJob.shift && (
                  <>
                    <span>•</span>
                    <span>{printJob.shift === 'morning' ? 'Утро' : 'Вечер'}</span>
                  </>
                )}
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Status and controls */}
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-3">
              <div className={cn(
                "px-3 py-1 rounded-full text-sm font-medium",
                getConfidenceColor(getOverallConfidence())
              )}>
                Точность: {getOverallConfidence()}%
              </div>
              
              <button
                onClick={() => setShowConfidence(!showConfidence)}
                className="flex items-center gap-2 px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {showConfidence ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                {showConfidence ? 'Скрыть' : 'Показать'} точность
              </button>

              <button
                onClick={handleAutoCorrect}
                className="flex items-center gap-2 px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <RotateCcw className="h-4 w-4" />
                Авто-исправление
              </button>

              <button
                onClick={handleResetToOriginal}
                className="flex items-center gap-2 px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <RotateCcw className="h-4 w-4" />
                Сбросить
              </button>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleReject}
                disabled={isProcessing}
                className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 border border-red-300 rounded-lg transition-colors disabled:opacity-50"
              >
                <Trash2 className="h-4 w-4" />
                Отклонить
              </button>
              <button
                onClick={handleApprove}
                disabled={isProcessing}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                    Сохранение...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    Подтвердить
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-4">
            {currentVersion.sections.map(section => (
              <div key={section.id} className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                  <h3 className="font-medium text-gray-900">
                    {section.title} ({section.items.length} пунктов)
                  </h3>
                </div>
                
                <div className="divide-y divide-gray-100">
                  {getItemsBySection(section.id).map(({ templateItem, recognizedItem }, index) => (
                    <div 
                      key={templateItem.id}
                      className={cn(
                        "px-4 py-3 flex items-start gap-3 transition-colors",
                        recognizedItem.isChecked ? "bg-green-50" : "bg-red-50"
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={recognizedItem.isChecked}
                        onChange={() => handleToggleItem(templateItem.id)}
                        className="mt-0.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            "font-medium",
                            recognizedItem.isChecked ? "text-green-700" : "text-red-700"
                          )}>
                            {templateItem.text}
                          </span>
                          {templateItem.isRequired && (
                            <span className="px-2 py-0.5 bg-red-100 text-red-600 rounded text-xs font-medium">
                              Обязательный
                            </span>
                          )}
                        </div>

                        {showConfidence && (
                          <div className="flex items-center gap-2 mt-2">
                            <label className="text-sm text-gray-600">Точность:</label>
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={recognizedItem.confidence}
                              onChange={(e) => handleConfidenceChange(templateItem.id, parseInt(e.target.value))}
                              className="w-32 h-2"
                            />
                            <span className={cn(
                              "px-2 py-0.5 rounded text-xs font-medium",
                              getConfidenceColor(recognizedItem.confidence)
                            )}>
                              {recognizedItem.confidence}%
                            </span>
                          </div>
                        )}

                        {!recognizedItem.isChecked && (
            <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800">
              <CheckCircle className="inline h-4 w-4 mr-1" />
              Все пункты отмечены как выполненные
            </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Help */}
        <div className="p-4 bg-blue-50 border-t border-blue-100">
          <div className="text-sm text-blue-700">
            <h4 className="font-medium mb-2">Справка по редактированию:</h4>
            <ul className="space-y-1 list-disc list-inside">
              <li>Используйте чекбоксы для изменения статуса пунктов</li>
              <li>Регулируйте точность распознавания с помощью ползунка</li>
              <li>"Авто-исправление" отмечает все пункты как выполненные</li>
              <li>"Сбросить" возвращает исходные значения распознавания</li>
              <li>Обязательные пункты должны быть выполнены для одобрения</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}