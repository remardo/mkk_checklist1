import { useState, useEffect } from 'react';
import { X, MapPin, Users, Building2, Trash2, Plus } from 'lucide-react';
import type { Office } from '../types';
import { cn } from '../utils/cn';

interface OfficeEditorProps {
  office?: Office;
  templates: Array<{ id: string; name: string; description: string }>;
  onSave: (office: Omit<Office, 'id'>) => void;
  onCancel: () => void;
  onDelete?: () => void;
}

export function OfficeEditor({ office, templates, onSave, onCancel, onDelete }: OfficeEditorProps) {
  const [formData, setFormData] = useState({
    name: office?.name || '',
    code: office?.code || '',
    address: office?.address || '',
    isActive: office?.isActive ?? true,
    managerIds: office?.managerIds || [],
    templateIds: office?.templateIds || [],
  });

  const [newManager, setNewManager] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.code.trim() || !formData.address.trim()) {
      alert('Заполните все обязательные поля');
      return;
    }
    onSave(formData);
  };

  const handleAddManager = () => {
    if (newManager.trim()) {
      setFormData(prev => ({
        ...prev,
        managerIds: [...prev.managerIds, newManager.trim()]
      }));
      setNewManager('');
    }
  };

  const handleRemoveManager = (managerId: string) => {
    setFormData(prev => ({
      ...prev,
      managerIds: prev.managerIds.filter(id => id !== managerId)
    }));
  };

  const toggleTemplate = (templateId: string) => {
    setFormData(prev => ({
      ...prev,
      templateIds: prev.templateIds.includes(templateId)
        ? prev.templateIds.filter(id => id !== templateId)
        : [...prev.templateIds, templateId]
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">
            {office ? 'Редактирование офиса' : 'Добавление нового офиса'}
          </h2>
          <button 
            onClick={onCancel}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <div className="flex-1 overflow-y-auto p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Название офиса *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Офис Центральный"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Код офиса *
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 uppercase"
                  placeholder="CTR"
                  maxLength={10}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="inline h-4 w-4 mr-1" />
                Адрес *
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="ул. Ленина, 1"
                required
              />
            </div>

            {/* Status */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                Офис активен
              </label>
            </div>

            {/* Managers */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                <Users className="inline h-4 w-4 mr-1" />
                Менеджеры
              </label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={newManager}
                  onChange={(e) => setNewManager(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddManager())}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="ID менеджера (u1, u2...)"
                />
                <button
                  type="button"
                  onClick={handleAddManager}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              {formData.managerIds.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.managerIds.map(id => (
                    <span
                      key={id}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                    >
                      Менеджер #{id}
                      <button
                        type="button"
                        onClick={() => handleRemoveManager(id)}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Available Templates */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                <Building2 className="inline h-4 w-4 mr-1" />
                Доступные шаблоны чеклистов
              </label>
              <div className="space-y-2 max-h-60 overflow-y-auto border border-gray-200 rounded-lg p-3">
                {templates.map(template => {
                  const isEnabled = formData.templateIds.includes(template.id);
                  return (
                    <label
                      key={template.id}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={isEnabled}
                          onChange={() => toggleTemplate(template.id)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <div>
                          <p className="font-medium text-gray-900">{template.name}</p>
                          <p className="text-sm text-gray-500">{template.description}</p>
                        </div>
                      </div>
                      <span className={cn(
                        "px-2 py-1 rounded text-xs font-medium",
                        isEnabled
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-500"
                      )}>
                        {isEnabled ? 'Включен' : 'Отключен'}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex justify-between">
          <div className="flex gap-3">
            {office && onDelete && (
              <button
                type="button"
                onClick={onDelete}
                className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 className="h-4 w-4" />
                Удалить
              </button>
            )}
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Отмена
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors"
            >
              {office ? 'Сохранить' : 'Создать'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}