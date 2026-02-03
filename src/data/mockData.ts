import type { User, Office, ChecklistTemplate, PrintJob, HistoryEvent } from '../types';

// Пользователи
export const mockUsers: User[] = [
  { id: 'u1', name: 'Иванов Алексей', email: 'ivanov@company.ru', role: 'admin', officeIds: ['o1', 'o2', 'o3'] },
  { id: 'u2', name: 'Петрова Мария', email: 'petrova@company.ru', role: 'manager', officeIds: ['o1'] },
  { id: 'u3', name: 'Сидоров Дмитрий', email: 'sidorov@company.ru', role: 'manager', officeIds: ['o2'] },
  { id: 'u4', name: 'Козлова Анна', email: 'kozlova@company.ru', role: 'employee', officeIds: ['o1'] },
  { id: 'u5', name: 'Новиков Сергей', email: 'novikov@company.ru', role: 'employee', officeIds: ['o2'] },
];

// Офисы
export const mockOffices: Office[] = [
  { 
    id: 'o1', 
    name: 'Офис Центральный', 
    code: 'CTR', 
    address: 'ул. Ленина, 1', 
    isActive: true, 
    managerIds: ['u2'], 
    templateIds: ['t1', 't2', 't3'] 
  },
  { 
    id: 'o2', 
    name: 'Офис Северный', 
    code: 'NRT', 
    address: 'пр. Мира, 25', 
    isActive: true, 
    managerIds: ['u3'], 
    templateIds: ['t1', 't2'] 
  },
  { 
    id: 'o3', 
    name: 'Офис Южный', 
    code: 'STH', 
    address: 'ул. Советская, 12', 
    isActive: true, 
    managerIds: [], 
    templateIds: ['t1', 't2', 't3'] 
  },
];

// Шаблоны чеклистов
export const mockTemplates: ChecklistTemplate[] = [
  {
    id: 't1',
    name: 'Чеклист открытия',
    type: 'opening',
    description: 'Обязательный чеклист при открытии офиса',
    status: 'published',
    currentVersionId: 'tv1',
    versions: [
      {
        id: 'tv1',
        templateId: 't1',
        versionNumber: 3,
        createdAt: '2024-01-15T10:00:00Z',
        createdBy: 'u1',
        status: 'published',
        sections: [
          {
            id: 's1',
            title: 'Проверка помещения',
            order: 1,
            items: [
              { id: 'i1', text: 'Проверить освещение во всех зонах', isRequired: true, order: 1 },
              { id: 'i2', text: 'Проверить работу кондиционера', isRequired: true, order: 2 },
              { id: 'i3', text: 'Проверить чистоту входной группы', isRequired: true, order: 3 },
              { id: 'i4', text: 'Проверить наличие расходных материалов', isRequired: false, order: 4 },
            ],
          },
          {
            id: 's2',
            title: 'Проверка оборудования',
            order: 2,
            items: [
              { id: 'i5', text: 'Включить компьютеры и проверить работу', isRequired: true, order: 1 },
              { id: 'i6', text: 'Проверить принтер', isRequired: true, order: 2 },
              { id: 'i7', text: 'Проверить терминал оплаты', isRequired: true, order: 3 },
              { id: 'i8', text: 'Проверить телефонную связь', isRequired: true, order: 4 },
            ],
          },
          {
            id: 's3',
            title: 'Безопасность',
            order: 3,
            items: [
              { id: 'i9', text: 'Проверить пожарные выходы', isRequired: true, order: 1 },
              { id: 'i10', text: 'Проверить наличие аптечки', isRequired: true, order: 2 },
              { id: 'i11', text: 'Проверить камеры видеонаблюдения', isRequired: false, order: 3 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 't2',
    name: 'Чеклист закрытия',
    type: 'closing',
    description: 'Обязательный чеклист при закрытии офиса',
    status: 'published',
    currentVersionId: 'tv2',
    versions: [
      {
        id: 'tv2',
        templateId: 't2',
        versionNumber: 2,
        createdAt: '2024-01-10T10:00:00Z',
        createdBy: 'u1',
        status: 'published',
        sections: [
          {
            id: 's4',
            title: 'Завершение работы',
            order: 1,
            items: [
              { id: 'i12', text: 'Выключить все компьютеры', isRequired: true, order: 1 },
              { id: 'i13', text: 'Выключить кондиционер', isRequired: true, order: 2 },
              { id: 'i14', text: 'Проверить закрытие окон', isRequired: true, order: 3 },
              { id: 'i15', text: 'Выключить освещение', isRequired: true, order: 4 },
            ],
          },
          {
            id: 's5',
            title: 'Безопасность',
            order: 2,
            items: [
              { id: 'i16', text: 'Проверить отсутствие посетителей', isRequired: true, order: 1 },
              { id: 'i17', text: 'Закрыть сейф', isRequired: true, order: 2 },
              { id: 'i18', text: 'Поставить на сигнализацию', isRequired: true, order: 3 },
              { id: 'i19', text: 'Закрыть входную дверь на ключ', isRequired: true, order: 4 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 't3',
    name: 'Еженедельная проверка',
    type: 'weekly',
    description: 'Еженедельная проверка состояния офиса',
    status: 'published',
    currentVersionId: 'tv3',
    versions: [
      {
        id: 'tv3',
        templateId: 't3',
        versionNumber: 1,
        createdAt: '2024-02-01T10:00:00Z',
        createdBy: 'u1',
        status: 'published',
        sections: [
          {
            id: 's6',
            title: 'Инвентаризация',
            order: 1,
            items: [
              { id: 'i20', text: 'Проверить запас бумаги', isRequired: true, order: 1 },
              { id: 'i21', text: 'Проверить запас чернил для принтера', isRequired: true, order: 2 },
              { id: 'i22', text: 'Проверить канцелярские принадлежности', isRequired: false, order: 3 },
              { id: 'i23', text: 'Проверить запас воды', isRequired: true, order: 4 },
            ],
          },
          {
            id: 's7',
            title: 'Техобслуживание',
            order: 2,
            items: [
              { id: 'i24', text: 'Очистить фильтры кондиционера', isRequired: false, order: 1 },
              { id: 'i25', text: 'Проверить состояние мебели', isRequired: true, order: 2 },
              { id: 'i26', text: 'Заказать уборку ковров (при необходимости)', isRequired: false, order: 3 },
            ],
          },
        ],
      },
    ],
  },
];

// Генерация истории для экземпляров
const generateHistory = (printJobId: string, status: string, createdBy: string): HistoryEvent[] => {
  const history: HistoryEvent[] = [
    {
      id: `h-${printJobId}-1`,
      printJobId,
      action: 'created',
      userId: createdBy,
      userName: mockUsers.find(u => u.id === createdBy)?.name || 'Неизвестно',
      timestamp: '2024-03-15T09:00:00Z',
      details: 'PDF сформирован',
    },
  ];

  if (status !== 'CREATED') {
    history.push({
      id: `h-${printJobId}-2`,
      printJobId,
      action: 'scan_uploaded',
      userId: createdBy,
      userName: mockUsers.find(u => u.id === createdBy)?.name || 'Неизвестно',
      timestamp: '2024-03-15T17:30:00Z',
      details: 'Скан загружен',
    });
  }

  if (['RECOGNIZED_AUTO_OK', 'RECOGNIZED_NEED_REVIEW', 'APPROVED', 'REJECTED'].includes(status)) {
    history.push({
      id: `h-${printJobId}-3`,
      printJobId,
      action: 'recognized',
      userId: 'system',
      userName: 'Система',
      timestamp: '2024-03-15T17:31:00Z',
      details: status === 'RECOGNIZED_AUTO_OK' ? 'Автоматическое распознавание успешно' : 'Требуется проверка',
    });
  }

  if (status === 'APPROVED') {
    history.push({
      id: `h-${printJobId}-4`,
      printJobId,
      action: 'approved',
      userId: 'u2',
      userName: 'Петрова Мария',
      timestamp: '2024-03-15T18:00:00Z',
      details: 'Чеклист подтверждён',
    });
  }

  return history;
};

// Экземпляры чеклистов
export const mockPrintJobs: PrintJob[] = [
  {
    id: 'pj1',
    shortId: 'CTR-001',
    officeId: 'o1',
    templateId: 't1',
    templateVersionId: 'tv1',
    templateName: 'Чеклист открытия',
    createdAt: '2024-03-15T09:00:00Z',
    createdBy: 'u4',
    createdByName: 'Козлова Анна',
    checklistDate: '2024-03-15',
    shift: 'morning',
    status: 'APPROVED',
    printCount: 1,
    scan: {
      id: 'sc1',
      printJobId: 'pj1',
      officeId: 'o1',
      uploadedBy: 'u4',
      uploadedAt: '2024-03-15T17:30:00Z',
      fileName: 'scan_pj1.pdf',
      fileUrl: '/scans/scan_pj1.pdf',
      processingStatus: 'processed',
    },
    recognitionResult: {
      id: 'rr1',
      scanId: 'sc1',
      printJobId: 'pj1',
      items: [
        { itemId: 'i1', isChecked: true, confidence: 98 },
        { itemId: 'i2', isChecked: true, confidence: 95 },
        { itemId: 'i3', isChecked: true, confidence: 97 },
        { itemId: 'i4', isChecked: false, confidence: 92 },
        { itemId: 'i5', isChecked: true, confidence: 99 },
        { itemId: 'i6', isChecked: true, confidence: 96 },
        { itemId: 'i7', isChecked: true, confidence: 94 },
        { itemId: 'i8', isChecked: true, confidence: 98 },
        { itemId: 'i9', isChecked: true, confidence: 97 },
        { itemId: 'i10', isChecked: true, confidence: 95 },
        { itemId: 'i11', isChecked: false, confidence: 91 },
      ],
      status: 'AUTO_OK',
      confirmedBy: 'u2',
      confirmedAt: '2024-03-15T18:00:00Z',
    },
    history: generateHistory('pj1', 'APPROVED', 'u4'),
  },
  {
    id: 'pj2',
    shortId: 'CTR-002',
    officeId: 'o1',
    templateId: 't2',
    templateVersionId: 'tv2',
    templateName: 'Чеклист закрытия',
    createdAt: '2024-03-15T21:00:00Z',
    createdBy: 'u4',
    createdByName: 'Козлова Анна',
    checklistDate: '2024-03-15',
    shift: 'evening',
    status: 'RECOGNIZED_NEED_REVIEW',
    printCount: 1,
    scan: {
      id: 'sc2',
      printJobId: 'pj2',
      officeId: 'o1',
      uploadedBy: 'u4',
      uploadedAt: '2024-03-15T22:00:00Z',
      fileName: 'scan_pj2.pdf',
      fileUrl: '/scans/scan_pj2.pdf',
      processingStatus: 'processed',
    },
    recognitionResult: {
      id: 'rr2',
      scanId: 'sc2',
      printJobId: 'pj2',
      items: [
        { itemId: 'i12', isChecked: true, confidence: 95 },
        { itemId: 'i13', isChecked: true, confidence: 55 },
        { itemId: 'i14', isChecked: true, confidence: 92 },
        { itemId: 'i15', isChecked: true, confidence: 97 },
        { itemId: 'i16', isChecked: true, confidence: 48 },
        { itemId: 'i17', isChecked: true, confidence: 94 },
        { itemId: 'i18', isChecked: true, confidence: 96 },
        { itemId: 'i19', isChecked: true, confidence: 98 },
      ],
      status: 'NEED_REVIEW',
    },
    history: generateHistory('pj2', 'RECOGNIZED_NEED_REVIEW', 'u4'),
  },
  {
    id: 'pj3',
    shortId: 'NRT-001',
    officeId: 'o2',
    templateId: 't1',
    templateVersionId: 'tv1',
    templateName: 'Чеклист открытия',
    createdAt: '2024-03-16T08:30:00Z',
    createdBy: 'u5',
    createdByName: 'Новиков Сергей',
    checklistDate: '2024-03-16',
    shift: 'morning',
    status: 'CREATED',
    printCount: 1,
    history: generateHistory('pj3', 'CREATED', 'u5'),
  },
  {
    id: 'pj4',
    shortId: 'CTR-003',
    officeId: 'o1',
    templateId: 't1',
    templateVersionId: 'tv1',
    templateName: 'Чеклист открытия',
    createdAt: '2024-03-16T09:00:00Z',
    createdBy: 'u4',
    createdByName: 'Козлова Анна',
    checklistDate: '2024-03-16',
    shift: 'morning',
    status: 'SCAN_RECEIVED',
    printCount: 1,
    scan: {
      id: 'sc4',
      printJobId: 'pj4',
      officeId: 'o1',
      uploadedBy: 'u4',
      uploadedAt: '2024-03-16T17:00:00Z',
      fileName: 'scan_pj4.jpg',
      fileUrl: '/scans/scan_pj4.jpg',
      processingStatus: 'received',
    },
    history: generateHistory('pj4', 'SCAN_RECEIVED', 'u4'),
  },
  {
    id: 'pj5',
    shortId: 'NRT-002',
    officeId: 'o2',
    templateId: 't2',
    templateVersionId: 'tv2',
    templateName: 'Чеклист закрытия',
    createdAt: '2024-03-14T21:00:00Z',
    createdBy: 'u5',
    createdByName: 'Новиков Сергей',
    checklistDate: '2024-03-14',
    shift: 'evening',
    status: 'RECOGNIZED_ERROR',
    printCount: 2,
    scan: {
      id: 'sc5',
      printJobId: 'pj5',
      officeId: 'o2',
      uploadedBy: 'u5',
      uploadedAt: '2024-03-14T22:30:00Z',
      fileName: 'scan_pj5.pdf',
      fileUrl: '/scans/scan_pj5.pdf',
      processingStatus: 'error',
    },
    recognitionResult: {
      id: 'rr5',
      scanId: 'sc5',
      printJobId: 'pj5',
      items: [],
      status: 'ERROR',
      errorReason: 'QR-код не найден или повреждён. Пожалуйста, отсканируйте документ повторно с лучшим качеством.',
    },
    history: generateHistory('pj5', 'RECOGNIZED_ERROR', 'u5'),
  },
  {
    id: 'pj6',
    shortId: 'CTR-004',
    officeId: 'o1',
    templateId: 't3',
    templateVersionId: 'tv3',
    templateName: 'Еженедельная проверка',
    createdAt: '2024-03-11T10:00:00Z',
    createdBy: 'u4',
    createdByName: 'Козлова Анна',
    checklistDate: '2024-03-11',
    status: 'RECOGNIZED_AUTO_OK',
    printCount: 1,
    scan: {
      id: 'sc6',
      printJobId: 'pj6',
      officeId: 'o1',
      uploadedBy: 'u4',
      uploadedAt: '2024-03-11T16:00:00Z',
      fileName: 'scan_pj6.pdf',
      fileUrl: '/scans/scan_pj6.pdf',
      processingStatus: 'processed',
    },
    recognitionResult: {
      id: 'rr6',
      scanId: 'sc6',
      printJobId: 'pj6',
      items: [
        { itemId: 'i20', isChecked: true, confidence: 99 },
        { itemId: 'i21', isChecked: true, confidence: 97 },
        { itemId: 'i22', isChecked: true, confidence: 95 },
        { itemId: 'i23', isChecked: true, confidence: 98 },
        { itemId: 'i24', isChecked: false, confidence: 96 },
        { itemId: 'i25', isChecked: true, confidence: 94 },
        { itemId: 'i26', isChecked: false, confidence: 92 },
      ],
      status: 'AUTO_OK',
    },
    history: generateHistory('pj6', 'RECOGNIZED_AUTO_OK', 'u4'),
  },
];
