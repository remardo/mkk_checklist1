// Роли пользователей
export type UserRole = 'admin' | 'manager' | 'employee';

// Статусы экземпляра чеклиста
export type PrintJobStatus = 
  | 'CREATED' 
  | 'SCAN_RECEIVED' 
  | 'RECOGNIZED_AUTO_OK' 
  | 'RECOGNIZED_NEED_REVIEW' 
  | 'RECOGNIZED_ERROR' 
  | 'APPROVED' 
  | 'REJECTED';

// Статус шаблона
export type TemplateStatus = 'draft' | 'published' | 'archived';

// Пользователь
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  officeIds: string[];
}

// Офис
export interface Office {
  id: string;
  name: string;
  code: string;
  address: string;
  isActive: boolean;
  managerIds: string[];
  templateIds: string[];
}

// Пункт чеклиста
export interface ChecklistItem {
  id: string;
  text: string;
  isRequired: boolean;
  order: number;
}

// Секция чеклиста
export interface ChecklistSection {
  id: string;
  title: string;
  items: ChecklistItem[];
  order: number;
}

// Версия шаблона
export interface TemplateVersion {
  id: string;
  templateId: string;
  versionNumber: number;
  createdAt: string;
  createdBy: string;
  sections: ChecklistSection[];
  status: TemplateStatus;
}

// Шаблон чеклиста
export interface ChecklistTemplate {
  id: string;
  name: string;
  type: 'opening' | 'closing' | 'weekly' | 'daily';
  description: string;
  status: TemplateStatus;
  currentVersionId: string | null;
  versions: TemplateVersion[];
}

// Результат распознавания пункта
export interface RecognizedItem {
  itemId: string;
  isChecked: boolean;
  confidence: number; // 0-100
}

// Скан
export interface Scan {
  id: string;
  printJobId: string | null;
  officeId: string | null;
  uploadedBy: string;
  uploadedAt: string;
  fileName: string;
  fileUrl: string;
  processingStatus: 'received' | 'processed' | 'error';
}

// Результат распознавания
export interface RecognitionResult {
  id: string;
  scanId: string;
  printJobId: string;
  items: RecognizedItem[];
  status: 'AUTO_OK' | 'NEED_REVIEW' | 'ERROR';
  errorReason?: string;
  confirmedBy?: string;
  confirmedAt?: string;
  comment?: string;
}

// Событие истории
export interface HistoryEvent {
  id: string;
  printJobId: string;
  action: 'created' | 'printed' | 'reprinted' | 'scan_uploaded' | 'recognized' | 'manually_corrected' | 'approved' | 'rejected';
  userId: string;
  userName: string;
  timestamp: string;
  details?: string;
}

// Экземпляр чеклиста (PrintJob)
export interface PrintJob {
  id: string;
  shortId: string;
  officeId: string;
  templateVersionId: string;
  templateId: string;
  templateName: string;
  createdAt: string;
  createdBy: string;
  createdByName: string;
  checklistDate: string;
  shift?: 'morning' | 'evening';
  status: PrintJobStatus;
  pdfUrl?: string;
  printCount: number;
  scan?: Scan;
  recognitionResult?: RecognitionResult;
  history: HistoryEvent[];
}

// Тип чеклиста для отображения
export const checklistTypeLabels: Record<string, string> = {
  opening: 'Открытие',
  closing: 'Закрытие',
  weekly: 'Еженедельный',
  daily: 'Ежедневный',
};

// Статусы для отображения
export const statusLabels: Record<PrintJobStatus, string> = {
  CREATED: 'Создан',
  SCAN_RECEIVED: 'Скан получен',
  RECOGNIZED_AUTO_OK: 'Распознан (OK)',
  RECOGNIZED_NEED_REVIEW: 'На проверке',
  RECOGNIZED_ERROR: 'Ошибка',
  APPROVED: 'Подтверждён',
  REJECTED: 'Отклонён',
};

export const statusColors: Record<PrintJobStatus, string> = {
  CREATED: 'bg-gray-100 text-gray-800',
  SCAN_RECEIVED: 'bg-blue-100 text-blue-800',
  RECOGNIZED_AUTO_OK: 'bg-green-100 text-green-800',
  RECOGNIZED_NEED_REVIEW: 'bg-yellow-100 text-yellow-800',
  RECOGNIZED_ERROR: 'bg-red-100 text-red-800',
  APPROVED: 'bg-emerald-100 text-emerald-800',
  REJECTED: 'bg-red-100 text-red-800',
};
