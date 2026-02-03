import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { User, Office, ChecklistTemplate, PrintJob, PrintJobStatus, RecognizedItem } from '../types';
import { mockUsers, mockOffices, mockTemplates, mockPrintJobs } from '../data/mockData';

interface AppContextType {
  // Аутентификация
  currentUser: User | null;
  login: (userId: string) => void;
  logout: () => void;
  
  // Данные
  offices: Office[];
  templates: ChecklistTemplate[];
  printJobs: PrintJob[];
  
  // Выбранный офис
  selectedOfficeId: string | null;
  setSelectedOfficeId: (id: string | null) => void;
  
  // Действия
  createPrintJob: (templateId: string, officeId: string, checklistDate: string, shift?: 'morning' | 'evening') => PrintJob;
  uploadScan: (printJobId: string, file: File) => void;
  updatePrintJobStatus: (printJobId: string, status: PrintJobStatus) => void;
  updateRecognitionItems: (printJobId: string, items: RecognizedItem[]) => void;
  approvePrintJob: (printJobId: string, comment?: string) => void;
  rejectPrintJob: (printJobId: string, comment?: string) => void;
  
  // Утилиты
  getUserOffices: () => Office[];
  getOfficeById: (id: string) => Office | undefined;
  getTemplateById: (id: string) => ChecklistTemplate | undefined;
  getPrintJobsByOffice: (officeId: string) => PrintJob[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [offices] = useState<Office[]>(mockOffices);
  const [templates] = useState<ChecklistTemplate[]>(mockTemplates);
  const [printJobs, setPrintJobs] = useState<PrintJob[]>(mockPrintJobs);
  const [selectedOfficeId, setSelectedOfficeId] = useState<string | null>(null);

  const login = useCallback((userId: string) => {
    const user = mockUsers.find(u => u.id === userId);
    if (user) {
      setCurrentUser(user);
      if (user.officeIds.length === 1) {
        setSelectedOfficeId(user.officeIds[0]);
      }
    }
  }, []);

  const logout = useCallback(() => {
    setCurrentUser(null);
    setSelectedOfficeId(null);
  }, []);

  const getUserOffices = useCallback(() => {
    if (!currentUser) return [];
    if (currentUser.role === 'admin') return offices;
    return offices.filter(o => currentUser.officeIds.includes(o.id));
  }, [currentUser, offices]);

  const getOfficeById = useCallback((id: string) => {
    return offices.find(o => o.id === id);
  }, [offices]);

  const getTemplateById = useCallback((id: string) => {
    return templates.find(t => t.id === id);
  }, [templates]);

  const getPrintJobsByOffice = useCallback((officeId: string) => {
    return printJobs.filter(pj => pj.officeId === officeId);
  }, [printJobs]);

  const createPrintJob = useCallback((templateId: string, officeId: string, checklistDate: string, shift?: 'morning' | 'evening') => {
    const template = templates.find(t => t.id === templateId);
    const office = offices.find(o => o.id === officeId);
    if (!template || !office || !currentUser) {
      throw new Error('Invalid template or office');
    }

    const newId = `pj${Date.now()}`;
    const count = printJobs.filter(pj => pj.officeId === officeId).length + 1;
    const shortId = `${office.code}-${String(count).padStart(3, '0')}`;

    const newPrintJob: PrintJob = {
      id: newId,
      shortId,
      officeId,
      templateId,
      templateVersionId: template.currentVersionId || '',
      templateName: template.name,
      createdAt: new Date().toISOString(),
      createdBy: currentUser.id,
      createdByName: currentUser.name,
      checklistDate,
      shift,
      status: 'CREATED',
      printCount: 1,
      history: [
        {
          id: `h-${newId}-1`,
          printJobId: newId,
          action: 'created',
          userId: currentUser.id,
          userName: currentUser.name,
          timestamp: new Date().toISOString(),
          details: 'PDF сформирован',
        },
      ],
    };

    setPrintJobs(prev => [newPrintJob, ...prev]);
    return newPrintJob;
  }, [templates, offices, currentUser, printJobs]);

  const uploadScan = useCallback((printJobId: string, file: File) => {
    if (!currentUser) return;

    setPrintJobs(prev => prev.map(pj => {
      if (pj.id !== printJobId) return pj;

      // Simulate scan processing with random result
      const random = Math.random();
      let newStatus: PrintJobStatus = 'SCAN_RECEIVED';
      
      // Simulate recognition after upload
      setTimeout(() => {
        setPrintJobs(p => p.map(job => {
          if (job.id !== printJobId) return job;
          
          let status: PrintJobStatus;
          let recognitionStatus: 'AUTO_OK' | 'NEED_REVIEW' | 'ERROR';
          
          if (random > 0.8) {
            status = 'RECOGNIZED_ERROR';
            recognitionStatus = 'ERROR';
          } else if (random > 0.5) {
            status = 'RECOGNIZED_NEED_REVIEW';
            recognitionStatus = 'NEED_REVIEW';
          } else {
            status = 'RECOGNIZED_AUTO_OK';
            recognitionStatus = 'AUTO_OK';
          }

          const template = templates.find(t => t.id === job.templateId);
          const version = template?.versions.find(v => v.id === job.templateVersionId);
          const allItems = version?.sections.flatMap(s => s.items) || [];

          return {
            ...job,
            status,
            recognitionResult: {
              id: `rr-${Date.now()}`,
              scanId: job.scan?.id || '',
              printJobId,
              items: allItems.map(item => ({
                itemId: item.id,
                isChecked: Math.random() > 0.2,
                confidence: recognitionStatus === 'NEED_REVIEW' 
                  ? Math.floor(Math.random() * 40) + 40
                  : Math.floor(Math.random() * 20) + 80,
              })),
              status: recognitionStatus,
              errorReason: recognitionStatus === 'ERROR' ? 'QR-код не найден или повреждён' : undefined,
            },
            history: [
              ...job.history,
              {
                id: `h-${printJobId}-${Date.now()}`,
                printJobId,
                action: 'recognized' as const,
                userId: 'system',
                userName: 'Система',
                timestamp: new Date().toISOString(),
                details: recognitionStatus === 'AUTO_OK' 
                  ? 'Автоматическое распознавание успешно' 
                  : recognitionStatus === 'NEED_REVIEW'
                  ? 'Требуется ручная проверка'
                  : 'Ошибка распознавания',
              },
            ],
          };
        }));
      }, 2000);

      return {
        ...pj,
        status: newStatus,
        scan: {
          id: `sc-${Date.now()}`,
          printJobId,
          officeId: pj.officeId,
          uploadedBy: currentUser.id,
          uploadedAt: new Date().toISOString(),
          fileName: file.name,
          fileUrl: URL.createObjectURL(file),
          processingStatus: 'received',
        },
        history: [
          ...pj.history,
          {
            id: `h-${printJobId}-${Date.now()}`,
            printJobId,
            action: 'scan_uploaded' as const,
            userId: currentUser.id,
            userName: currentUser.name,
            timestamp: new Date().toISOString(),
            details: `Скан загружен: ${file.name}`,
          },
        ],
      };
    }));
  }, [currentUser, templates]);

  const updatePrintJobStatus = useCallback((printJobId: string, status: PrintJobStatus) => {
    setPrintJobs(prev => prev.map(pj => 
      pj.id === printJobId ? { ...pj, status } : pj
    ));
  }, []);

  const updateRecognitionItems = useCallback((printJobId: string, items: RecognizedItem[]) => {
    if (!currentUser) return;

    setPrintJobs(prev => prev.map(pj => {
      if (pj.id !== printJobId || !pj.recognitionResult) return pj;
      
      return {
        ...pj,
        recognitionResult: {
          ...pj.recognitionResult,
          items,
        },
        history: [
          ...pj.history,
          {
            id: `h-${printJobId}-${Date.now()}`,
            printJobId,
            action: 'manually_corrected' as const,
            userId: currentUser.id,
            userName: currentUser.name,
            timestamp: new Date().toISOString(),
            details: 'Результат распознавания исправлен вручную',
          },
        ],
      };
    }));
  }, [currentUser]);

  const approvePrintJob = useCallback((printJobId: string, comment?: string) => {
    if (!currentUser) return;

    setPrintJobs(prev => prev.map(pj => {
      if (pj.id !== printJobId) return pj;
      
      return {
        ...pj,
        status: 'APPROVED' as PrintJobStatus,
        recognitionResult: pj.recognitionResult ? {
          ...pj.recognitionResult,
          confirmedBy: currentUser.id,
          confirmedAt: new Date().toISOString(),
          comment,
        } : undefined,
        history: [
          ...pj.history,
          {
            id: `h-${printJobId}-${Date.now()}`,
            printJobId,
            action: 'approved' as const,
            userId: currentUser.id,
            userName: currentUser.name,
            timestamp: new Date().toISOString(),
            details: comment || 'Чеклист подтверждён',
          },
        ],
      };
    }));
  }, [currentUser]);

  const rejectPrintJob = useCallback((printJobId: string, comment?: string) => {
    if (!currentUser) return;

    setPrintJobs(prev => prev.map(pj => {
      if (pj.id !== printJobId) return pj;
      
      return {
        ...pj,
        status: 'REJECTED' as PrintJobStatus,
        recognitionResult: pj.recognitionResult ? {
          ...pj.recognitionResult,
          confirmedBy: currentUser.id,
          confirmedAt: new Date().toISOString(),
          comment,
        } : undefined,
        history: [
          ...pj.history,
          {
            id: `h-${printJobId}-${Date.now()}`,
            printJobId,
            action: 'rejected' as const,
            userId: currentUser.id,
            userName: currentUser.name,
            timestamp: new Date().toISOString(),
            details: comment || 'Чеклист отклонён',
          },
        ],
      };
    }));
  }, [currentUser]);

  return (
    <AppContext.Provider
      value={{
        currentUser,
        login,
        logout,
        offices,
        templates,
        printJobs,
        selectedOfficeId,
        setSelectedOfficeId,
        createPrintJob,
        uploadScan,
        updatePrintJobStatus,
        updateRecognitionItems,
        approvePrintJob,
        rejectPrintJob,
        getUserOffices,
        getOfficeById,
        getTemplateById,
        getPrintJobsByOffice,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
