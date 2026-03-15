'use client';
import { useState, useEffect } from 'react';
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
  const [cvText, setCvText] = useState('');
  const [evaluating, setEvaluating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [evaluation, setEvaluation] = useState<CvEvaluationGlobalResult | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialCV?.cvText) {
      setCvText(initialCV.cvText);
    }
  }, [initialCV?.cvText]);

  const textLength = cvText.length;
  const canEvaluate = textLength >= 50 && !evaluating;

  async function handleEvaluate() {
    if (cvText.length < 50) {
      setError(ta.cvTextTooShort || 'El CV debe tener al menos 50 caracteres');
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
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as CvEvaluationGlobalResult;
      setEvaluation(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : ta.toastEvaluateError);
    } finally {
      setEvaluating(false);
    }
  }

  async function handleSave() {
    if (!evaluation || evaluation.score < MIN_SCORE) return;
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/applications/base-cv', {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ cvText }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      onSaved({ cvText, lastEvaluatedAt: new Date().toISOString() });
    } catch (e) {
      setError(e instanceof Error ? e.message : ta.toastSaveError);
    } finally {
      setSaving(false);
    }
  }

  const canSave = evaluation && evaluation.score >= MIN_SCORE;

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

      {/* Evaluate Button */}
      <button
        onClick={handleEvaluate}
        disabled={!canEvaluate}
        className={`btn-secondary flex items-center gap-2 ${!canEvaluate ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {evaluating ? <Spinner /> : <IconSpark />}
        {evaluating ? (ta.evaluating || 'Evaluando...') : (ta.evaluateCv || 'Evaluar mi CV')}
      </button>

      {/* Error */}
      {error && (
        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          <p className="font-mono text-[11px] text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Evaluation Result */}
      {evaluation && (
        <div className="card p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className="font-mono text-[14px] font-bold text-slate-700 dark:text-slate-300">
                  {ta.scoreLabel || 'Score'}: {evaluation.score}/100
                </span>
                {evaluation.score >= MIN_SCORE ? (
                  <span className="flex items-center gap-1 font-mono text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-400/10 text-emerald-700 dark:text-emerald-300">
                    <IconCheck /> {ta.cvEvalApprovedBadge || 'Aprobado'}
                  </span>
                ) : (
                  <span className="flex items-center gap-1 font-mono text-[10px] px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-400/10 text-amber-700 dark:text-amber-300">
                    <IconWarning /> {ta.cvEvalNeedMore?.replace('{n}', String(MIN_SCORE - evaluation.score)) || 'Necesita mejoras'}
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
                {ta.suggestionsLabel || 'Sugerencias'}
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

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={!canSave || saving}
        className={`btn-primary flex items-center gap-2 ${!canSave ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {saving ? <Spinner /> : <IconSave />}
        {saving ? (ta.saving || 'Guardando...') : (ta.saveBaseCv || 'Guardar CV Base')}
      </button>
    </div>
  );
}
