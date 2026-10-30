import React, { useState } from 'react';
import { 
  X, 
  Tag, 
  Plus, 
  Edit3, 
  Trash2, 
  Check, 
  AlertCircle, 
  Palette
} from 'lucide-react';
import { ProcessCategoryItem, ProcessStep } from '../types';
import { CATEGORY_COLORS, getCategoryBadgeStyle } from '../utils/categoryColors';

interface CategoryManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: ProcessCategoryItem[];
  steps: ProcessStep[];
  onAddCategory: (category: Omit<ProcessCategoryItem, 'id'>) => void;
  onUpdateCategory: (category: ProcessCategoryItem) => void;
  onDeleteCategory: (id: string) => void;
}

export const CategoryManagerModal: React.FC<CategoryManagerModalProps> = ({
  isOpen,
  onClose,
  categories,
  steps,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
}) => {
  if (!isOpen) return null;

  // New Category State
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState('sky');
  const [newDescription, setNewDescription] = useState('');

  // Editing State
  const [editingCategory, setEditingCategory] = useState<ProcessCategoryItem | null>(null);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    onAddCategory({
      name: newName.trim(),
      color: newColor,
      description: newDescription.trim(),
    });

    setNewName('');
    setNewDescription('');
    setNewColor('sky');
    setIsAdding(false);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory || !editingCategory.name.trim()) return;
    onUpdateCategory(editingCategory);
    setEditingCategory(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white">
              <Tag className="w-4 h-4 text-brand-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Prozess-Kategorien verwalten (CRUD)
              </h3>
              <p className="text-xs text-slate-500">
                Eigene Kategorien erstellen, farblich anpassen, umbenennen oder löschen
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="overflow-y-auto py-4 space-y-4 flex-1">
          
          {/* Top Button / Form to Add Category */}
          {!isAdding ? (
            <button
              onClick={() => setIsAdding(true)}
              className="w-full py-2.5 px-4 rounded-xl border-2 border-dashed border-slate-300 hover:border-brand-500 hover:bg-brand-50/30 text-slate-600 hover:text-brand-700 font-semibold text-xs flex items-center justify-center gap-2 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Neue Kategorie erstellen (z.B. Spritzguss, Lackierung, Montage)</span>
            </button>
          ) : (
            <form onSubmit={handleCreate} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">Neue Kategorie anlegen</span>
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="text-xs text-slate-500 hover:text-slate-800"
                >
                  Abbrechen
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Bezeichnung *</label>
                  <input
                    type="text"
                    required
                    placeholder="z.B. Oberflächenbeschichtung"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-white rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Beschreibung (Optional)</label>
                  <input
                    type="text"
                    placeholder="z.B. Pulverbeschichtung, Eloxal"
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-white rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              {/* Color Swatches */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-slate-500" />
                  <span>Farbe für Badge auswählen:</span>
                </label>
                <div className="flex items-center gap-2 flex-wrap">
                  {Object.entries(CATEGORY_COLORS).map(([colorKey, colorOpt]) => {
                    const isSelected = newColor === colorKey;
                    return (
                      <button
                        key={colorKey}
                        type="button"
                        onClick={() => setNewColor(colorKey)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium border transition-all ${colorOpt.bg} ${colorOpt.border} ${colorOpt.text} ${
                          isSelected ? 'ring-2 ring-slate-900 shadow-sm font-bold scale-105' : 'opacity-70 hover:opacity-100'
                        }`}
                      >
                        <span className={`w-2 h-2 rounded-full ${colorOpt.dot}`}></span>
                        <span>{colorOpt.name}</span>
                        {isSelected && <Check className="w-3 h-3 ml-0.5" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800"
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs rounded-lg bg-brand-600 hover:bg-brand-500 text-white font-medium"
                >
                  Kategorie speichern
                </button>
              </div>
            </form>
          )}

          {/* List of Categories with Edit/Delete Actions */}
          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-white font-semibold">
                <tr>
                  <th className="py-2.5 px-3">Vorschau Badge</th>
                  <th className="py-2.5 px-3">Kategorie Name</th>
                  <th className="py-2.5 px-3">Beschreibung</th>
                  <th className="py-2.5 px-3 text-center">Verwendet in</th>
                  <th className="py-2.5 px-3 text-center w-28">Aktionen (CRUD)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {categories.map((cat) => {
                  const style = getCategoryBadgeStyle(cat.color);
                  const isEditingThis = editingCategory?.id === cat.id;
                  const assignedCount = steps.filter(s => s.category === cat.id || s.category === cat.name).length;

                  if (isEditingThis) {
                    return (
                      <tr key={cat.id} className="bg-brand-50/50 p-2">
                        <td colSpan={5} className="p-3">
                          <form onSubmit={handleSaveEdit} className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-800">Kategorie bearbeiten</span>
                              <button
                                type="button"
                                onClick={() => setEditingCategory(null)}
                                className="text-slate-400 hover:text-slate-700"
                              >
                                Abbrechen
                              </button>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Name</label>
                                <input
                                  type="text"
                                  required
                                  value={editingCategory.name}
                                  onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                                  className="w-full px-2.5 py-1 text-xs bg-white rounded border border-slate-300"
                                />
                              </div>
                              <div>
                                <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Beschreibung</label>
                                <input
                                  type="text"
                                  value={editingCategory.description || ''}
                                  onChange={(e) => setEditingCategory({ ...editingCategory, description: e.target.value })}
                                  className="w-full px-2.5 py-1 text-xs bg-white rounded border border-slate-300"
                                />
                              </div>
                            </div>

                            {/* Color Selector */}
                            <div>
                              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Farbe auswählen:</label>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                {Object.entries(CATEGORY_COLORS).map(([colorKey, colorOpt]) => (
                                  <button
                                    key={colorKey}
                                    type="button"
                                    onClick={() => setEditingCategory({ ...editingCategory, color: colorKey })}
                                    className={`px-2 py-0.5 rounded text-[11px] border ${colorOpt.bg} ${colorOpt.border} ${colorOpt.text} ${
                                      editingCategory.color === colorKey ? 'ring-2 ring-slate-900 font-bold' : 'opacity-70'
                                    }`}
                                  >
                                    {colorOpt.name}
                                  </button>
                                ))}
                              </div>
                            </div>

                            <div className="flex justify-end gap-2 pt-1">
                              <button
                                type="button"
                                onClick={() => setEditingCategory(null)}
                                className="px-3 py-1 text-xs text-slate-600"
                              >
                                Abbrechen
                              </button>
                              <button
                                type="submit"
                                className="px-3 py-1 text-xs rounded bg-brand-600 text-white font-medium shadow-xs"
                              >
                                Übernehmen
                              </button>
                            </div>
                          </form>
                        </td>
                      </tr>
                    );
                  }

                  return (
                    <tr key={cat.id} className="hover:bg-slate-50 transition-colors">
                      {/* Badge Preview */}
                      <td className="py-2.5 px-3">
                        <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${style.bg} ${style.border} ${style.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`}></span>
                          <span>{cat.name}</span>
                        </span>
                      </td>

                      {/* Name */}
                      <td className="py-2.5 px-3 font-semibold text-slate-800">
                        {cat.name}
                      </td>

                      {/* Description */}
                      <td className="py-2.5 px-3 text-slate-500">
                        {cat.description || '-'}
                      </td>

                      {/* Assigned count */}
                      <td className="py-2.5 px-3 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-mono ${
                          assignedCount > 0 ? 'bg-slate-100 text-slate-800 font-bold' : 'text-slate-400'
                        }`}>
                          {assignedCount} Schritte
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-2.5 px-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => setEditingCategory(cat)}
                            className="p-1 text-slate-500 hover:text-brand-600 hover:bg-slate-100 rounded transition-colors"
                            title="Kategorie bearbeiten"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => {
                              if (assignedCount > 0) {
                                if (!confirm(`Diese Kategorie wird derzeit von ${assignedCount} Prozessschritten verwendet. Trotzdem löschen?`)) {
                                  return;
                                }
                              } else {
                                if (!confirm(`Kategorie "${cat.name}" wirklich löschen?`)) {
                                  return;
                                }
                              }
                              onDeleteCategory(cat.id);
                            }}
                            className="p-1 text-slate-400 hover:text-red-600 hover:bg-slate-100 rounded transition-colors"
                            title="Kategorie löschen"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

        </div>

        {/* Footer */}
        <div className="flex justify-between items-center pt-3 border-t border-slate-200 text-xs text-slate-500">
          <span>Gesamt: <strong>{categories.length}</strong> Kategorien konfiguriert</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-900 text-white font-medium hover:bg-slate-800 transition-colors"
          >
            Fertig
          </button>
        </div>

      </div>
    </div>
  );
};
