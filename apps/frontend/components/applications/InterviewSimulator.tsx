'use client';
import { useState } from 'react';
import { Application, getHeaders } from './types';
import { Spinner } from '../ui/Spinner';

const IconSpark = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);
const IconSave = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
    <polyline points="17 21 17 13 7 13 7 21" />
    <polyline points="7 3 7 8 15 8" />
  </svg>
);
const IconDownload = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);
const IconTrash = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6" />
    <path d="M14 11v6" />
    <path d="M9 6V4h6v2" />
  </svg>
);

interface InterviewQuestion {
  question: string;
  answer: string;
}

interface Props {
  application: Application;
  baseCV?: string;
  onUpdate: (id: string, patch: Partial<Application>) => void;
  t: { applications: Record<string, string> };
}

export function InterviewSimulator({ application, baseCV, onUpdate, t }: Props) {
  const ta = t.applications;

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);

  const hasInterview = application.interviewQuestions && application.interviewAnswers;
  const isGenerated = !!application.interviewGeneratedAt;

  async function generateInterview() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/applications/${application.id}/interview-simulator`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          cvText: baseCV || application.cvGeneratedEn || application.cvGeneratedEs || '',
          jobDescription: application.jobOffer,
          position: application.position,
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as { questions: InterviewQuestion[] };
      setQuestions(data.questions || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : ta.toastGenerateError);
    } finally {
      setLoading(false);
    }
  }

  async function saveInterview() {
    if (questions.length === 0) return;
    setSaving(true);
    try {
      const qText = questions.map(q => q.question).join('\n');
      const aText = questions.map(q => q.answer).join('\n\n');
      await fetch(`/api/applications/${application.id}`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ 
          interviewQuestions: qText, 
          interviewAnswers: aText,
          interviewGeneratedAt: new Date().toISOString(),
        }),
      });
      onUpdate(application.id, { 
        interviewQuestions: qText, 
        interviewAnswers: aText,
        interviewGeneratedAt: new Date().toISOString(),
      });
    } catch {
      setError(ta.toastAppSaveError);
    } finally {
      setSaving(false);
    }
  }

  async function deleteInterview() {
    setSaving(true);
    try {
      await fetch(`/api/applications/${application.id}`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ 
          interviewQuestions: null, 
          interviewAnswers: null,
          interviewGeneratedAt: null,
        }),
      });
      onUpdate(application.id, { 
        interviewQuestions: undefined, 
        interviewAnswers: undefined,
        interviewGeneratedAt: undefined,
      });
      setQuestions([]);
    } catch {
      setError(ta.toastAppSaveError);
    } finally {
      setSaving(false);
    }
  }

  function parseStoredInterview() {
    if (!application.interviewQuestions || !application.interviewAnswers) return [];
    const qLines = application.interviewQuestions.split('\n').filter(q => q.trim());
    const aParts = application.interviewAnswers.split('\n\n');
    return qLines.map((q, i) => ({
      question: q.replace(/^\d+[\.\)]\s*/, '').trim(),
      answer: aParts[i]?.trim() || '',
    }));
  }

  function downloadInterview() {
    const displayQuestions = questions.length > 0 ? questions : parseStoredInterview();
    const content = displayQuestions
      .map((q, i) => `P${i + 1}: ${q.question}\n\nR${i + 1}: ${q.answer}`)
      .join('\n\n---\n\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `entrevista-${application.company}-${application.position}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const displayQuestions = questions.length > 0 ? questions : parseStoredInterview();

  return (
    <div className="card overflow-hidden">
      <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <h3 className="font-mono text-[11px] uppercase tracking-widest text-violet-600 dark:text-violet-400">
            {ta.interviewSimulatorTitle ?? 'Entrevista Simulada'}
          </h3>
          {isGenerated && (
            <span className="font-mono text-[8px] px-2 py-0.5 rounded-full bg-violet-100 dark:bg-violet-400/10 text-violet-600 dark:text-violet-400">
              {ta.interviewGenerated ?? 'Generado'}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={generateInterview}
            disabled={loading}
            className="btn-primary text-[10px] py-1.5 px-3 flex items-center gap-1.5"
          >
            {loading ? <Spinner size={12} /> : <IconSpark />}
            {ta.generateInterview ?? 'Generar entrevista'}
          </button>
          {displayQuestions.length > 0 && (
            <>
              <button
                onClick={saveInterview}
                disabled={saving}
                className="btn-ghost text-[10px] py-1.5 px-3 flex items-center gap-1.5"
              >
                {saving ? <Spinner size={12} /> : <IconSave />}
                {ta.saveInterview ?? 'Guardar'}
              </button>
              <button
                onClick={downloadInterview}
                className="btn-ghost text-[10px] py-1.5 px-3 flex items-center gap-1.5"
              >
                <IconDownload />
                {ta.downloadInterview ?? 'Descargar'}
              </button>
              <button
                onClick={deleteInterview}
                disabled={saving}
                className="font-mono text-[10px] py-1.5 px-3 flex items-center gap-1.5 text-rose-500 hover:text-rose-600 dark:hover:text-rose-400"
              >
                <IconTrash />
              </button>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 dark:bg-rose-400/5 border-b border-rose-200 dark:border-rose-400/20">
          <p className="font-mono text-[10px] text-rose-600 dark:text-rose-400">{error}</p>
        </div>
      )}

      <div className="p-4 space-y-4 max-h-[500px] overflow-y-auto">
        {loading && (
          <div className="flex items-center gap-3 py-8 justify-center">
            <Spinner size={16} />
            <p className="font-mono text-[10px] text-slate-400">
              {ta.generatingInterview ?? 'Generando entrevista con IA...'}
            </p>
          </div>
        )}

        {!loading && displayQuestions.length === 0 && (
          <div className="text-center py-8">
            <p className="font-mono text-[11px] text-slate-400 mb-3">
              {ta.interviewEmpty ?? 'Genera una entrevista simulada con preguntas y respuestas específicas para este puesto.'}
            </p>
            <button
              onClick={generateInterview}
              className="btn-primary text-[10px] py-2 px-4 inline-flex items-center gap-2"
            >
              <IconSpark />
              {ta.generateInterview ?? 'Generar entrevista'}
            </button>
          </div>
        )}

        {displayQuestions.map((item, index) => (
          <div key={index} className="space-y-2 pb-4 border-b border-slate-100 dark:border-slate-800 last:border-0">
            <p className="font-mono text-[10px] font-semibold text-slate-700 dark:text-slate-300">
              <span className="text-violet-500 mr-1">P{index + 1}:</span>
              {item.question}
            </p>
            <p className="font-mono text-[10px] text-slate-600 dark:text-slate-400 leading-relaxed pl-4">
              <span className="text-sky-500 mr-1">R{index + 1}:</span>
              {item.answer}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
