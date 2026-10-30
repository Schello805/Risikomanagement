import React, { useState } from 'react';
import { X, SlidersHorizontal, Save } from 'lucide-react';
import { ProjectMeta } from '../types';

interface ProjectMetaModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectMeta: ProjectMeta;
  onSave: (meta: ProjectMeta) => void;
}

export const ProjectMetaModal: React.FC<ProjectMetaModalProps> = ({
  isOpen,
  onClose,
  projectMeta,
  onSave,
}) => {
  if (!isOpen) return null;

  const [formState, setFormState] = useState<ProjectMeta>({ ...projectMeta });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formState);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white">
              <SlidersHorizontal className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Projektstammdaten & Deckblatt
              </h3>
              <p className="text-xs text-slate-500">
                Erscheint auf allen Excel- & PDF-Exports und dem FMEA-Deckblatt
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

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Projektbezeichnung / Produktlinie *</label>
            <input
              type="text"
              required
              value={formState.projectName}
              onChange={(e) => setFormState({ ...formState, projectName: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-white rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Dokumentennummer</label>
              <input
                type="text"
                value={formState.documentNumber}
                onChange={(e) => setFormState({ ...formState, documentNumber: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-white rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Teilenummer / Sachnummer</label>
              <input
                type="text"
                value={formState.partNumber}
                onChange={(e) => setFormState({ ...formState, partNumber: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-white rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Teilebeschreibung / Baugruppe</label>
            <input
              type="text"
              value={formState.partDescription}
              onChange={(e) => setFormState({ ...formState, partDescription: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-white rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Produktionsstandort / Werk</label>
              <input
                type="text"
                value={formState.plantLocation}
                onChange={(e) => setFormState({ ...formState, plantLocation: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-white rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Kunde / Markt</label>
              <input
                type="text"
                value={formState.customer}
                onChange={(e) => setFormState({ ...formState, customer: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-white rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Verantwortlicher Projektleiter</label>
              <input
                type="text"
                value={formState.responsibleLead}
                onChange={(e) => setFormState({ ...formState, responsibleLead: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-white rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Revisionsstand (Dokument)</label>
              <input
                type="text"
                value={formState.revisionNumber}
                onChange={(e) => setFormState({ ...formState, revisionNumber: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-white rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">FMEA Kernteam</label>
            <textarea
              rows={2}
              value={formState.coreTeam}
              onChange={(e) => setFormState({ ...formState, coreTeam: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-white rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-medium rounded-lg bg-brand-600 hover:bg-brand-500 text-white shadow-sm"
            >
              <Save className="w-4 h-4" />
              <span>Stammdaten speichern</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
