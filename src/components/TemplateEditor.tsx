import { useState, useEffect } from 'react';
import { X, Plus, Trash2, GripVertical, ChevronUp, ChevronDown } from 'lucide-react';
import type { ChecklistSection, ChecklistItem } from '../types';
import { cn } from '../utils/cn';

interface TemplateEditorProps {
  templateId: string;
  versionId: string;
  templateName: string;
  sections: ChecklistSection[];
  onSave: (templateId: string, versionId: string, sections: ChecklistSection[]) => void;
  onCancel: () => void;
}

export function TemplateEditor({ templateId, versionId, templateName, sections, onSave, onCancel }: TemplateEditorProps) {
  const [localSections, setLocalSections] = useState<ChecklistSection[]>([]);
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);

  useEffect(() => {
    setLocalSections(JSON.parse(JSON.stringify(sections)));
  }, [sections]);

  const handleAddSection = () => {
    const newSection: ChecklistSection = {
      id: `s${Date.now()}`,
      title: 'Новая секция',
      items: [],
      order: localSections.length,
    };
    setLocalSections([...localSections, newSection]);
    setEditingSectionId(newSection.id);
  };

  const handleDeleteSection = (sectionId: string) => {
    setLocalSections(localSections.filter(s => s.id !== sectionId));
    if (editingSectionId === sectionId) setEditingSectionId(null);
  };

  const handleUpdateSectionTitle = (sectionId: string, title: string) => {
    setLocalSections(localSections.map(s => 
      s.id === sectionId ? { ...s, title } : s
    ));
  };

  const handleAddItem = (sectionId: string) => {
    const newItem: ChecklistItem = {
      id: `i${Date.now()}`,
      text: 'Новый пункт',
      isRequired: false,
      order: 0,
    };
    setLocalSections(localSections.map(s => 
      s.id === sectionId ? { ...s, items: [...s.items, newItem] } : s
    ));
    setEditingItemId(newItem.id);
  };

  const handleDeleteItem = (sectionId: string, itemId: string) => {
    setLocalSections(localSections.map(s => 
      s.id === sectionId ? { ...s, items: s.items.filter(i => i.id !== itemId) } : s
    ));
    if (editingItemId === itemId) setEditingItemId(null);
  };

  const handleUpdateItem = (sectionId: string, itemId: string, updates: Partial<ChecklistItem>) => {
    setLocalSections(localSections.map(s => 
      s.id === sectionId ? {
        ...s,
        items: s.items.map(i => i.id === itemId ? { ...i, ...updates } : i),
      } : s
    ));
  };

  const handleMoveSection = (index: number, direction: 'up' | 'down') => {
    const newSections = [...localSections];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex < 0 || targetIndex >= newSections.length) return;
    
    [newSections[index], newSections[targetIndex]] = [newSections[targetIndex], newSections[index]];
    setLocalSections(newSections);
  };

  const handleMoveItem = (sectionId: string, itemIndex: number, direction: 'up' | 'down') => {
    const section = localSections.find(s => s.id === sectionId);
    if (!section) return;
    
    const newItems = [...section.items];
    const targetIndex = direction === 'up' ? itemIndex - 1 : itemIndex + 1;
    
    if (targetIndex < 0 || targetIndex >= newItems.length) return;
    
    [newItems[itemIndex], newItems[targetIndex]] = [newItems[targetIndex], newItems[itemIndex]];
    
    setLocalSections(localSections.map(s => 
      s.id === sectionId ? { ...s, items: newItems } : s
    ));
  };

  const handleSave = () => {
    console.log('Save button clicked', { templateId, versionId, sections: localSections });
    const orderedSections = localSections.map((section, sIndex) => ({
      ...section,
      order: sIndex,
      items: section.items.map((item, iIndex) => ({
        ...item,
        order: iIndex,
      })),
    }));
    console.log('Calling onSave with:', { templateId, versionId, sections: orderedSections });
    onSave(templateId, versionId, orderedSections);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Редактирование шаблона</h2>
            <p className="text-gray-500">{templateName}</p>
          </div>
          <button 
            onClick={onCancel}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-4">
            {localSections.map((section, sIndex) => (
              <div key={section.id} className="border border-gray-200 rounded-lg overflow-hidden">
                {/* Section Header */}
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center gap-3">
                  <GripVertical className="h-4 w-4 text-gray-400 cursor-move" />
                  <span className="text-sm text-gray-500 w-8">{sIndex + 1}.</span>
                  
                  {editingSectionId === section.id ? (
                    <input
                      type="text"
                      value={section.title}
                      onChange={(e) => handleUpdateSectionTitle(section.id, e.target.value)}
                      onBlur={() => setEditingSectionId(null)}
                      onKeyDown={(e) => e.key === 'Enter' && setEditingSectionId(null)}
                      className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      autoFocus
                    />
                  ) : (
                    <h4 
                      className="flex-1 font-medium text-gray-900 cursor-pointer hover:text-blue-600"
                      onClick={() => setEditingSectionId(section.id)}
                    >
                      {section.title}
                    </h4>
                  )}
                  
                  <span className="text-sm text-gray-500">{section.items.length} пунктов</span>
                  
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleMoveSection(sIndex, 'up')}
                      disabled={sIndex === 0}
                      className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronUp className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleMoveSection(sIndex, 'down')}
                      disabled={sIndex === localSections.length - 1}
                      className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronDown className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <button
                    onClick={() => handleDeleteSection(section.id)}
                    className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                {/* Items */}
                <div className="divide-y divide-gray-100">
                  {section.items.map((item, iIndex) => (
                    <div key={item.id} className="px-4 py-3 flex items-start gap-3 hover:bg-gray-50">
                      <GripVertical className="h-4 w-4 text-gray-400 cursor-move mt-0.5" />
                      <span className="text-sm text-gray-400 w-6">{sIndex + 1}.{iIndex + 1}</span>
                      
                      {editingItemId === item.id ? (
                        <input
                          type="text"
                          value={item.text}
                          onChange={(e) => handleUpdateItem(section.id, item.id, { text: e.target.value })}
                          onBlur={() => setEditingItemId(null)}
                          onKeyDown={(e) => e.key === 'Enter' && setEditingItemId(null)}
                          className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          autoFocus
                        />
                      ) : (
                        <span 
                          className="flex-1 text-gray-700 cursor-pointer hover:text-blue-600"
                          onClick={() => setEditingItemId(item.id)}
                        >
                          {item.text}
                        </span>
                      )}
                      
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={item.isRequired}
                          onChange={(e) => handleUpdateItem(section.id, item.id, { isRequired: e.target.checked })}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-600">Обязательный</span>
                      </label>
                      
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleMoveItem(section.id, iIndex, 'up')}
                          disabled={iIndex === 0}
                          className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                          <ChevronUp className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleMoveItem(section.id, iIndex, 'down')}
                          disabled={iIndex === section.items.length - 1}
                          className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                          <ChevronDown className="h-4 w-4" />
                        </button>
                      </div>
                      
                      <button
                        onClick={() => handleDeleteItem(section.id, item.id)}
                        className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  
                  <button
                    onClick={() => handleAddItem(section.id)}
                    className="w-full px-4 py-3 text-sm text-blue-600 hover:bg-blue-50 flex items-center justify-center gap-2 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    Добавить пункт
                  </button>
                </div>
              </div>
            ))}
            
            <button
              onClick={handleAddSection}
              className="w-full px-4 py-3 border-2 border-dashed border-gray-200 rounded-lg text-gray-500 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50 flex items-center justify-center gap-2 transition-colors"
            >
              <Plus className="h-5 w-5" />
              Добавить секцию
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Отмена
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors"
          >
            Сохранить
          </button>
        </div>
      </div>
    </div>
  );
}