import React, { useState } from 'react';
import { X, CheckSquare, AlertCircle } from 'lucide-react';
import { ControlPlanItem, ProcessStep, SpecialCharacteristicType } from '../types';

interface ControlPlanItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: ControlPlanItem | null;
  steps: ProcessStep[];
  onSave: (item: ControlPlanItem) => void;
}

export const ControlPlanItemModal: React.FC<ControlPlanItemModalProps> = ({
  isOpen,
  onClose,
  item,
  steps,
  onSave,
}) => {
  if (!isOpen) return null;

  const isNew = !item;
  const defaultStepId = steps.length > 0 ? steps[0].id : '';

  const [stepId, setStepId] = useState(item?.stepId || defaultStepId);
  const [characteristicName, setCharacteristicName] = useState(item?.characteristicName || '');
  const [characteristicType, setCharacteristicType] = useState<'product' | 'process'>(item?.characteristicType || 'product');
  const [isSpecial, setIsSpecial] = useState(item?.isSpecial || false);
  const [specialType, setSpecialType] = useState<SpecialCharacteristicType>(item?.specialType || 'SC');
  const [specification, setSpecification] = useState(item?.specification || '');
  const [evaluationMeasurementTechnique, setEvaluationMeasurementTechnique] = useState(item?.evaluationMeasurementTechnique || '');
  const [sampleSize, setSampleSize] = useState(item?.sampleSize || '5 Teile');
  const [sampleFrequency, setSampleFrequency] = useState(item?.sampleFrequency || 'pro Charge');
  const [controlMethod, setControlMethod] = useState(item?.controlMethod || 'Prüfprotokoll');
  const [reactionPlan, setReactionPlan] = useState(item?.reactionPlan || 'Sperren, QS informieren');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!characteristicName.trim() || !stepId) return;

    const savedItem: ControlPlanItem = {
      id: item?.id || `cp-${Date.now()}`,
      stepId,
      characteristicName: characteristicName.trim(),
      characteristicType,
      isSpecial,
      specialType: isSpecial ? specialType : undefined,
      specification: specification.trim(),
      evaluationMeasurementTechnique: evaluationMeasurementTechnique.trim(),
      sampleSize: sampleSize.trim(),
      sampleFrequency: sampleFrequency.trim(),
      controlMethod: controlMethod.trim(),
      reactionPlan: reactionPlan.trim(),
      linkedFmeaItemId: item?.linkedFmeaItemId,
    };

    onSave(savedItem);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white">
              <CheckSquare className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {isNew ? 'Neuen Prüfpunkt im Kontrollplan anlegen' : 'Kontrollplan-Prüfpunkt bearbeiten'}
              </h3>
              <p className="text-xs text-slate-500">
                Lenkungsmethoden & Prüfvorgaben nach Produktionslenkungsplan (PLP)
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Prozessschritt *</label>
              <select
                value={stepId}
                onChange={(e) => setStepId(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
              >
                {steps.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.stepNumber} - {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Merkmalstyp</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setCharacteristicType('product')}
                  className={`py-2 text-xs rounded-lg font-medium border text-center transition-all ${
                    characteristicType === 'product'
                      ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  Produktmerkmal
                </button>
                <button
                  type="button"
                  onClick={() => setCharacteristicType('process')}
                  className={`py-2 text-xs rounded-lg font-medium border text-center transition-all ${
                    characteristicType === 'process'
                      ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  Prozessmerkmal
                </button>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Prüfmerkmal Bezeichnung *</label>
            <input
              type="text"
              required
              placeholder="z.B. Flanschdicke, Dichtheit, Barcode-Lesbarkeit"
              value={characteristicName}
              onChange={(e) => setCharacteristicName(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          {/* Besonderes Merkmal CC/SC */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-between gap-4">
            <div>
              <span className="block text-xs font-semibold text-slate-800">Besonderes Merkmal (Klassifizierung)</span>
              <span className="text-[11px] text-slate-500">Erfordert erhöhte Überwachung (CC = Sicherheit, SC = Funktion)</span>
            </div>

            <div className="flex items-center gap-2">
              <label className="inline-flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isSpecial}
                  onChange={(e) => setIsSpecial(e.target.checked)}
                  className="rounded text-brand-600 focus:ring-brand-500 w-4 h-4"
                />
                <span className="font-medium">Besonderes Merkmal</span>
              </label>

              {isSpecial && (
                <select
                  value={specialType}
                  onChange={(e) => setSpecialType(e.target.value as SpecialCharacteristicType)}
                  className="px-2 py-1 text-xs rounded bg-white border border-slate-300 font-bold font-mono"
                >
                  <option value="SC">SC (Funktion)</option>
                  <option value="CC">CC (Sicherheit)</option>
                </select>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Spezifikation / Toleranz / Sollwert *</label>
              <input
                type="text"
                required
                placeholder="z.B. 12.0 mm ± 0.15 mm"
                value={specification}
                onChange={(e) => setSpecification(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Prüfmittel / Messmethode</label>
              <input
                type="text"
                placeholder="z.B. Digitaler Messschieber, Grenzlehre"
                value={evaluationMeasurementTechnique}
                onChange={(e) => setEvaluationMeasurementTechnique(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Stichprobenumfang</label>
              <input
                type="text"
                placeholder="z.B. 5 Teile, 100%"
                value={sampleSize}
                onChange={(e) => setSampleSize(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Prüfhäufigkeit</label>
              <input
                type="text"
                placeholder="z.B. stündlich, je Charge, pro Schicht"
                value={sampleFrequency}
                onChange={(e) => setSampleFrequency(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Lenkungsmethode</label>
              <input
                type="text"
                placeholder="z.B. SPC-Regelkarte, Prüfprotokoll QS"
                value={controlMethod}
                onChange={(e) => setControlMethod(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Reaktionsplan bei Abweichung</label>
              <input
                type="text"
                placeholder="z.B. Fertigung stoppen, Charge sperren, QS informieren"
                value={reactionPlan}
                onChange={(e) => setReactionPlan(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          {/* Footer Actions */}
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
              className="px-5 py-2 text-xs font-medium rounded-lg bg-brand-600 hover:bg-brand-500 text-white shadow-sm"
            >
              Prüfpunkt speichern
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
