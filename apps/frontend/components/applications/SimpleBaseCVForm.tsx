'use client';
import { useState } from 'react';
import { BaseCV, CvEvaluationGlobalResult, getHeaders } from './types';
import { IconCheck, IconSave, IconSpark, IconWarning, Spinner } from './icons';

const MIN_SCORE = 85;

interface Props {
  initialCV: BaseCV;
  onSaved: (cv: BaseCV) => void;
  t: { applications: Record<string, string> };
  lang: string;
}

export function SimpleBaseCVForm({ initialCV, onSaved, t, lang }: Props) {
  const ta = t.applications;
  
  // Estado simple - inicializar con el valor que venga o vacío
  const [cvText, setCvText] = useState(initialCV?.cvText || '');
  const [evaluating, setEvaluating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [evaluation, setEvaluation] = useState<CvEvaluationGlobalResult | null>(null);
  const [error, setError] = useState('');

  // Validación simple
  const hasText = cvText.length >= 50;
  const canEvaluate = hasText && !evaluating;
  const canSave = evaluation !== null && evaluation.score >= MIN_SCORE && !saving;

  // DEBUG: Ver valores en consola
  console.log('DEBUG:', { cvText: cvText.length, hasText, canEvaluate, evaluating });

  async function handleEvaluate() {
    if (!hasText) {
      setError('El CV debe tener al menos 50 caracteres');
      return;
    }
    
    setEvaluating(true);
    setError('');
    
    try {
      const res = await fetch('/api/applications/base-cv/evaluate-global', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ cvText, lang }),
      });
      
      if (!res.ok) {
        throw new Error(`Error ${res.status}`);
      }
      
      const data = (await res.json()) as CvEvaluationGlobalResult;
      setEvaluation(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al evaluar');
    } finally {
      setEvaluating(false);
    }
  }

  async function handleSave() {
    if (!canSave) return;
    
    setSaving(true);
    setError('');
    
    try {
      const res = await fetch('/api/applications/base-cv', {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ cvText }),
      });
      
      if (!res.ok) {
        throw new Error(`Error ${res.status}`);
      }
      
      onSaved({ cvText, lastEvaluatedAt: new Date().toISOString() });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al guardar');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Textarea */}
      <div>
        <label className="block font-mono text-[11px] uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-2">
          {ta.baseCvTextareaLabel || 'Copia y pega tu CV aquí'}
        </label>
        <textarea
          value={cvText}
          onChange={(e) => {
            setCvText(e.target.value);
            setEvaluation(null);
          }}
          placeholder={ta.baseCvTextareaPlaceholder || 'Juan Pérez\nemail@email.com\nTeléfono: +52 555 123 4567\n\nRESUMEN\nDesarrollador con 5 años de experiencia...\n\nEXPERIENCIA\nEmpresa - Rol (2020-Actual)\n• Logro cuantificable...'}
          className="w-full h-96 font-mono text-[11px] p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-sky-500 focus:border-transparent resize-y"
        />
      </div>

      {/* Contador de caracteres - DEBUG */}
      <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">
        DEBUG: length={cvText.length} hasText={String(hasText)} canEvaluate={String(canEvaluate)} evaluating={String(evaluating)}
      </div>

      {/* Contador de caracteres */}
      <p className="font-mono text-[10px] text-slate-400">
        {cvText.length} caracteres (mínimo 50)
      </p>

      {/* Botón Evaluar - probar sin disabled */}
      <button
        type="button"
        onClick={handleEvaluate}
        className="btn-secondary flex items-center gap-2"
      >
        {evaluating ? <Spinner /> : <IconSpark />}
        {evaluating ? 'Evaluando...' : 'Evaluar mi CV'}
      </button>

      {/* Error */}
      {error && (
        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          <p className="font-mono text-[11px] text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Resultado de evaluación */}
      {evaluation && (
        <div className="card p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className="font-mono text-[14px] font-bold text-slate-700 dark:text-slate-300">
                  Score: {evaluation.score}/100
                </span>
                {evaluation.score >= MIN_SCORE ? (
                  <span className="flex items-center gap-1 font-mono text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-400/10 text-emerald-700 dark:text-emerald-300">
                    <IconCheck /> Aprobado
                  </span>
                ) : (
                  <span className="flex items-center gap-1 font-mono text-[10px] px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-400/10 text-amber-700 dark:text-amber-300">
                    <IconWarning /> Necesita mejoras
                  </span>
                )}
              </div>
              <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    evaluation.score >= MIN_SCORE ? 'bg-emerald-500' : 'bg-amber-500'
                  }`}
                  style={{ width: `${evaluation.score}%` }}
                />
              </div>
            </div>
          </div>

          {evaluation.summary && (
            <p className="font-mono text-[11px] text-slate-500 dark:text-slate-400 italic mb-4">
              "{evaluation.summary}"
            </p>
          )}

          {evaluation.suggestions.length > 0 && (
            <div className="space-y-2">
              <p className="font-mono text-[10px] uppercase tracking-widest text-slate-400">
                Sugerencias
              </p>
              <ul className="space-y-1">
                {evaluation.suggestions.map((s, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="font-mono text-[10px] text-amber-600 dark:text-amber-400">•</span>
                    <span className="font-mono text-[10.5px] text-slate-600 dark:text-slate-300">{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Botón Guardar */}
      <button
        type="button"
        onClick={handleSave}
        className="btn-primary flex items-center gap-2"
      >
        {saving ? <Spinner /> : <IconSave />}
        {saving ? 'Guardando...' : 'Guardar CV Base'}
      </button>
    </div>
  );
}
