import { useState, useCallback } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, X, FileImage } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { statusLabels, statusColors } from '../types';
import { cn } from '../utils/cn';

export function UploadPage() {
  const { printJobs, selectedOfficeId, uploadScan, currentUser } = useApp();
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedJobId, setSelectedJobId] = useState<string>('');
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'processing' | 'done'>('idle');

  // Get jobs that can receive scans
  const eligibleJobs = printJobs.filter(job => 
    job.officeId === selectedOfficeId &&
    ['CREATED', 'RECOGNIZED_ERROR'].includes(job.status) &&
    (currentUser?.role !== 'employee' || job.createdBy === currentUser.id)
  );

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      handleFile(files[0]);
    }
  };

  const handleFile = (file: File) => {
    const validTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      alert('Поддерживаются только PDF, JPG и PNG файлы');
      return;
    }
    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile || !selectedJobId) return;

    setUploadStatus('uploading');
    
    // Simulate upload delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setUploadStatus('processing');
    uploadScan(selectedJobId, selectedFile);

    // Simulate processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setUploadStatus('done');
  };

  const handleReset = () => {
    setSelectedFile(null);
    setSelectedJobId('');
    setUploadStatus('idle');
  };

  if (!selectedOfficeId) {
    return (
      <div className="bg-white rounded-xl p-8 text-center shadow-sm border border-gray-100">
        <Upload className="h-12 w-12 mx-auto mb-3 text-gray-300" />
        <p className="text-gray-500">Выберите офис для загрузки скана</p>
      </div>
    );
  }

  // Success state
  if (uploadStatus === 'done') {
    return (
      <div className="bg-white rounded-xl p-8 text-center shadow-sm border border-gray-100">
        <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Скан загружен!</h2>
        <p className="text-gray-500 mb-6">
          Файл принят и обрабатывается. Результат распознавания появится в карточке экземпляра.
        </p>
        <button
          onClick={handleReset}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Загрузить ещё один скан
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Drop zone */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={cn(
          "relative border-2 border-dashed rounded-xl p-8 transition-colors",
          dragActive 
            ? "border-blue-500 bg-blue-50" 
            : selectedFile
            ? "border-green-500 bg-green-50"
            : "border-gray-300 bg-white hover:border-gray-400"
        )}
      >
        <input
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={uploadStatus !== 'idle'}
        />
        
        <div className="text-center">
          {selectedFile ? (
            <>
              <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <FileImage className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">{selectedFile.name}</h3>
              <p className="text-sm text-gray-500 mb-4">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} МБ
              </p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedFile(null);
                }}
                className="inline-flex items-center gap-1 text-sm text-red-600 hover:text-red-700"
              >
                <X className="h-4 w-4" />
                Удалить
              </button>
            </>
          ) : (
            <>
              <Upload className={cn(
                "h-12 w-12 mx-auto mb-4",
                dragActive ? "text-blue-500" : "text-gray-400"
              )} />
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                {dragActive ? 'Отпустите файл' : 'Перетащите скан сюда'}
              </h3>
              <p className="text-sm text-gray-500">
                или нажмите для выбора файла (PDF, JPG, PNG)
              </p>
            </>
          )}
        </div>
      </div>

      {/* Job selection */}
      {selectedFile && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-900 mb-4">
            Выберите экземпляр чеклиста
          </h3>
          
          {eligibleJobs.length > 0 ? (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {eligibleJobs.map(job => (
                <label
                  key={job.id}
                  className={cn(
                    "flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-colors",
                    selectedJobId === job.id
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-100 hover:border-gray-200"
                  )}
                >
                  <input
                    type="radio"
                    name="printJob"
                    value={job.id}
                    checked={selectedJobId === job.id}
                    onChange={(e) => setSelectedJobId(e.target.value)}
                    className="sr-only"
                  />
                  <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-gray-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">{job.shortId}</span>
                      <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", statusColors[job.status])}>
                        {statusLabels[job.status]}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 truncate">{job.templateName}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(job.checklistDate).toLocaleDateString('ru-RU')} • {job.createdByName}
                    </p>
                  </div>
                  <div className={cn(
                    "h-6 w-6 rounded-full border-2 flex items-center justify-center",
                    selectedJobId === job.id ? "border-blue-500 bg-blue-500" : "border-gray-300"
                  )}>
                    {selectedJobId === job.id && (
                      <CheckCircle className="h-4 w-4 text-white" />
                    )}
                  </div>
                </label>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 mx-auto mb-3 text-yellow-500" />
              <p className="text-gray-500">
                Нет доступных экземпляров для загрузки скана.
              </p>
              <p className="text-sm text-gray-400 mt-1">
                Сначала создайте и распечатайте чеклист.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Upload button */}
      {selectedFile && selectedJobId && (
        <div className="flex justify-end">
          <button
            onClick={handleUpload}
            disabled={uploadStatus !== 'idle'}
            className={cn(
              "flex items-center gap-2 px-6 py-3 rounded-lg text-white transition-colors",
              uploadStatus === 'idle'
                ? "bg-blue-600 hover:bg-blue-700"
                : "bg-blue-400 cursor-not-allowed"
            )}
          >
            {uploadStatus === 'uploading' && (
              <>
                <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                Загрузка...
              </>
            )}
            {uploadStatus === 'processing' && (
              <>
                <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                Обработка...
              </>
            )}
            {uploadStatus === 'idle' && (
              <>
                <Upload className="h-5 w-5" />
                Загрузить скан
              </>
            )}
          </button>
        </div>
      )}

      {/* Help text */}
      <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
        <h4 className="font-medium text-blue-900 mb-2">Как загрузить скан?</h4>
        <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
          <li>Отсканируйте заполненный чеклист в формате PDF, JPG или PNG</li>
          <li>Перетащите файл в область выше или нажмите для выбора</li>
          <li>Выберите соответствующий экземпляр чеклиста</li>
          <li>Нажмите "Загрузить скан"</li>
        </ol>
        <p className="text-sm text-blue-600 mt-2">
          QR-код на скане будет автоматически распознан для привязки к экземпляру.
        </p>
      </div>
    </div>
  );
}
