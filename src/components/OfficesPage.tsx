import { useState } from 'react';
import { Building2, MapPin, Users, FileText, Check, X, Plus, Edit2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { cn } from '../utils/cn';

export function OfficesPage() {
  const { offices, templates } = useApp();
  const [selectedOffice, setSelectedOffice] = useState<string | null>(null);

  const office = offices.find(o => o.id === selectedOffice);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Управление офисами</h2>
          <p className="text-gray-500">Всего офисов: {offices.length}</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <Plus className="h-5 w-5" />
          Добавить офис
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Office list */}
        <div className="lg:col-span-1 space-y-3">
          {offices.map(o => (
            <button
              key={o.id}
              onClick={() => setSelectedOffice(o.id)}
              className={cn(
                "w-full bg-white rounded-xl p-4 shadow-sm border-2 text-left transition-all",
                selectedOffice === o.id
                  ? "border-blue-500 ring-2 ring-blue-100"
                  : "border-gray-100 hover:border-gray-200"
              )}
            >
              <div className="flex items-start gap-3">
                <div className={cn(
                  "h-10 w-10 rounded-lg flex items-center justify-center",
                  o.isActive ? "bg-blue-100" : "bg-gray-100"
                )}>
                  <Building2 className={cn(
                    "h-5 w-5",
                    o.isActive ? "text-blue-600" : "text-gray-400"
                  )} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900 truncate">{o.name}</h3>
                    <span className={cn(
                      "px-2 py-0.5 rounded-full text-xs font-medium",
                      o.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                    )}>
                      {o.isActive ? 'Активен' : 'Неактивен'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 truncate">{o.code} • {o.address}</p>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Office details */}
        <div className="lg:col-span-2">
          {office ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-2xl font-bold text-gray-900">{office.name}</h2>
                      <span className={cn(
                        "px-2 py-1 rounded-full text-sm font-medium",
                        office.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                      )}>
                        {office.isActive ? 'Активен' : 'Неактивен'}
                      </span>
                    </div>
                    <p className="text-gray-500">Код: {office.code}</p>
                  </div>
                  <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <Edit2 className="h-4 w-4" />
                    Редактировать
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Address */}
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2 flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Адрес
                  </h3>
                  <p className="text-gray-900">{office.address}</p>
                </div>

                {/* Managers */}
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2 flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Менеджеры
                  </h3>
                  {office.managerIds.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {office.managerIds.map(id => (
                        <span key={id} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                          Менеджер #{id}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400 italic">Менеджеры не назначены</p>
                  )}
                </div>

                {/* Available templates */}
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-3 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Доступные чеклисты
                  </h3>
                  <div className="space-y-2">
                    {templates.map(t => {
                      const isEnabled = office.templateIds.includes(t.id);
                      return (
                        <div 
                          key={t.id}
                          className={cn(
                            "flex items-center justify-between p-3 rounded-lg border",
                            isEnabled ? "border-green-200 bg-green-50" : "border-gray-200"
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "h-8 w-8 rounded-lg flex items-center justify-center",
                              isEnabled ? "bg-green-100" : "bg-gray-100"
                            )}>
                              {isEnabled ? (
                                <Check className="h-4 w-4 text-green-600" />
                              ) : (
                                <X className="h-4 w-4 text-gray-400" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{t.name}</p>
                              <p className="text-sm text-gray-500">{t.description}</p>
                            </div>
                          </div>
                          <button className={cn(
                            "px-3 py-1 rounded-lg text-sm font-medium transition-colors",
                            isEnabled
                              ? "text-red-600 hover:bg-red-50"
                              : "text-blue-600 hover:bg-blue-50"
                          )}>
                            {isEnabled ? 'Отключить' : 'Включить'}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-100 text-center">
              <Building2 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Выберите офис</h3>
              <p className="text-gray-500">Выберите офис из списка слева для просмотра деталей</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
