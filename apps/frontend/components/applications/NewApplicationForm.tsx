'use client';
import { useState } from 'react';
import { getHeaders } from './types';
import { AtsRing, IconDownload, IconSave, IconSpark, IconCheck, IconEdit, Spinner } from './icons';
import { jsPDF } from 'jspdf';

function printATS(cvText: string, lang: 'es' | 'en', position: string, company: string) {
  const SECTION_RX =
    /^(CONTACT(?:O)?|SUMMARY|RESUMEN|EXPERIENCE|EXPERIENCIA|EDUCATION|EDUCACI[OÓ]N|SKILLS|HABILIDADES|LANGUAGES|IDIOMAS|CERTIFICATIONS|CERTIFICACIONES)$/i;
  const ROLE_RX = /^.{3,60}[|–—-].{3,}$/;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'letter',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 40;
  const maxWidth = pageWidth - margin * 2;
  let y = margin;

  const checkNewPage = (needed: number) => {
    if (y + needed > pageHeight - margin) {
      doc.addPage();
      y = margin;
    }
  };

  const lines = cvText.split('\n');
  const processedLines: { text: string; type: 'h2' | 'role' | 'bullet' | 'normal' }[] = [];

  for (const raw of lines) {
    const line = raw.trimEnd();
    if (line === '') {
      processedLines.push({ text: '', type: 'normal' });
    } else if (SECTION_RX.test(line.trim())) {
      processedLines.push({ text: line.trim(), type: 'h2' });
    } else if (line.trimStart().startsWith('- ')) {
      processedLines.push({ text: line.trimStart().slice(2), type: 'bullet' });
    } else if (ROLE_RX.test(line.trim())) {
      processedLines.push({ text: line.trim(), type: 'role' });
    } else {
      processedLines.push({ text: line.trim(), type: 'normal' });
    }
  }

  for (const item of processedLines) {
    if (item.text === '') {
      y += 12;
      continue;
    }

    if (item.type === 'h2') {
      checkNewPage(24);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text(item.text.toUpperCase(), margin, y);
      y += 20;
    } else if (item.type === 'role') {
      checkNewPage(18);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      const roleLines = doc.splitTextToSize(item.text, maxWidth);
      doc.text(roleLines, margin, y);
      y += roleLines.length * 14 + 4;
    } else if (item.type === 'bullet') {
      checkNewPage(14);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      const bulletText = `- ${item.text}`;
      const bulletLines = doc.splitTextToSize(bulletText, maxWidth - 18);
      doc.text(bulletLines, margin + 18, y);
      y += bulletLines.length * 14;
    } else {
      checkNewPage(14);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      const textLines = doc.splitTextToSize(item.text, maxWidth);
      doc.text(textLines, margin, y);
      y += textLines.length * 14;
    }
  }

  const filename = `CV-${position.replace(/[^a-zA-Z0-9]/g, '-')}-${company.replace(/[^a-zA-Z0-9]/g, '-')}-${lang}.pdf`;
  doc.save(filename);
}

const APPLIED_FROM_OPTIONS = [
  'LinkedIn',
  'Indeed',
  'Glassdoor',
  'InfoJobs',
  'OCC Mundial',
  'Computrabajo',
  'Sitio web de la empresa',
  'Referido',
  'Otro',
];

interface Props {
  cvComplete: boolean;
  onSaved: () => void;
  onGoToBaseCV: () => void;
  t: { applications: Record<string, string> };
  lang: string;
}

export function NewApplicationForm({ cvComplete, onSaved, onGoToBaseCV, t, lang }: Props) {
  const ta = t.applications;

  const [form, setForm] = useState({ 
    company: '', 
    position: '', 
    jobOffer: '', 
    appliedFrom: '',
    location: '',
    salary: '',
    sourceUrl: '',
  });
  const [generating, setGen] = useState(false);
  const [genError, setErr] = useState('');
  const [atsScore, setScore] = useState<number | null>(null);

  const [generatedCv, setGeneratedCv] = useState('');
  const [isEdited, setIsEdited] = useState(false);
  const [cvLang, setCvLang] = useState<'en' | 'es'>('en');

  const [savedAppId, setSavedAppId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const hasResult = atsScore !== null;

  async function generate() {
    if (!form.company || !form.position || !form.jobOffer) {
      setErr(ta.toastFormIncomplete);
      return;
    }
    setGen(true);
    setGeneratedCv('');
    setScore(null);
    setIsEdited(false);
    setErr('');
    setSavedAppId(null);
    try {
      const res = await fetch('/api/applications/generate-cv', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ 
          company: form.company, 
          position: form.position, 
          jobOffer: form.jobOffer,
          location: form.location,
          salary: form.salary,
          sourceUrl: form.sourceUrl,
        }),
      });
      if (!res.ok)
        throw new Error(
          ((await res.json()) as { message?: string }).message ?? `HTTP ${res.status}`
        );
      const data = (await res.json()) as { atsScore: number; cv?: string; lang?: string };
      setScore(data.atsScore ?? 0);
      setGeneratedCv(data.cv ?? '');
      setCvLang(data.lang === 'es' ? 'es' : 'en');
    } catch (e) {
      setErr(e instanceof Error ? e.message : ta.toastGenerateError);
    } finally {
      setGen(false);
    }
  }

  async function save() {
    if (!generatedCv) return;
    setSaving(true);
    try {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          company: form.company || undefined,
          position: form.position || undefined,
          jobOffer: form.jobOffer || undefined,
          atsScore: atsScore ?? 0,
          generatedCvText: generatedCv,
          generatedCvLang: cvLang,
          appliedFrom: form.appliedFrom || undefined,
          location: form.location || undefined,
          salary: form.salary || undefined,
          sourceUrl: form.sourceUrl || undefined,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: `HTTP ${res.status}` }));
        throw new Error(err.message || `HTTP ${res.status}`);
      }
      const saved = (await res.json()) as { id: string };
      setSavedAppId(saved.id ?? null);
    } catch {
      setErr(ta.toastAppSaveError);
    } finally {
      setSaving(false);
    }
  }

  function finish() {
    setForm({ company: '', position: '', jobOffer: '', appliedFrom: '', location: '', salary: '', sourceUrl: '' });
    setGeneratedCv('');
    setScore(null);
    setIsEdited(false);
    setSavedAppId(null);
    onSaved();
  }

  if (!cvComplete) {
    return (
      <div className="card p-12 text-center space-y-4">
        <p className="font-mono text-[13px] font-semibold text-slate-700 dark:text-slate-300">
          {ta.cvRequiredTitle}
        </p>
        <p className="font-mono text-[11px] text-slate-400">{ta.cvRequiredDesc}</p>
        <button onClick={onGoToBaseCV} className="btn-primary text-[11px] py-2.5 px-6 mx-auto">
          {ta.goToBaseCV}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {!hasResult && (
        <div className="card p-6 space-y-5">
          <h2 className="font-mono text-[11px] uppercase tracking-[0.3em] text-slate-500">
            {ta.newAppFormTitle}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {(['company', 'position'] as const).map((key) => (
              <div key={key}>
                <label className="block font-mono text-[10px] uppercase tracking-widest text-slate-400 mb-1.5">
                  {ta['field' + key.charAt(0).toUpperCase() + key.slice(1)]}
                  <span className="text-rose-400 ml-1">{ta.fieldRequired}</span>
                </label>
                <input
                  value={form[key]}
                  onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))}
                  placeholder={ta['field' + key.charAt(0).toUpperCase() + key.slice(1) + 'Placeholder']}
                  className="input-field"
                />
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="block font-mono text-[10px] uppercase tracking-widest text-slate-400 mb-1.5">
                {ta.fieldLocation ?? 'Ubicación'}
              </label>
              <input
                value={form.location}
                onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))}
                placeholder={ta.fieldLocationPlaceholder ?? 'Ciudad, País'}
                className="input-field"
              />
            </div>
            <div>
              <label className="block font-mono text-[10px] uppercase tracking-widest text-slate-400 mb-1.5">
                {ta.fieldSalary ?? 'Salario'}
              </label>
              <input
                value={form.salary}
                onChange={(e) => setForm((p) => ({ ...p, salary: e.target.value }))}
                placeholder={ta.fieldSalaryPlaceholder ?? '\$100k - \$150k'}
                className="input-field"
              />
            </div>
            <div>
              <label className="block font-mono text-[10px] uppercase tracking-widest text-slate-400 mb-1.5">
                {ta.fieldSourceUrl ?? 'URL de la oferta'}
              </label>
              <input
                value={form.sourceUrl}
                onChange={(e) => setForm((p) => ({ ...p, sourceUrl: e.target.value }))}
                placeholder={ta.fieldSourceUrlPlaceholder ?? 'https://...'}
                className="input-field"
              />
            </div>
          </div>

          <div>
            <label className="block font-mono text-[10px] uppercase tracking-widest text-slate-400 mb-1.5">
              {ta.fieldJobOffer} <span className="text-rose-400">{ta.fieldRequired}</span>
            </label>
            <textarea
              value={form.jobOffer}
              onChange={(e) => setForm((p) => ({ ...p, jobOffer: e.target.value }))}
              rows={8}
              placeholder={ta.fieldJobOfferPlaceholder}
              className="input-field resize-y font-mono text-[11px]"
            />
            <p className="font-mono text-[9.5px] text-slate-400 mt-1">
              {ta.jobOfferHint ?? 'Pega la descripción completa — requisitos, responsabilidades y tech stack.'}
            </p>
          </div>

          <div>
            <label className="block font-mono text-[10px] uppercase tracking-widest text-slate-400 mb-1.5">
              {ta.appliedFromLabel ?? 'Origen de la postulación'}
            </label>
            <select
              value={form.appliedFrom}
              onChange={(e) => setForm((p) => ({ ...p, appliedFrom: e.target.value }))}
              className="input-field font-mono text-[11px]"
            >
              <option value="">{ta.appliedFromPlaceholder ?? 'Seleccioná de dónde aplicás...'}</option>
              {APPLIED_FROM_OPTIONS.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </div>

          {genError && <p className="font-mono text-[10px] text-rose-500">{genError}</p>}

          <button onClick={generate} disabled={generating} className="btn-primary text-[11px] py-2.5 px-6 flex items-center gap-2">
            {generating ? (
              <>
                <Spinner sm />
                {ta.generatingCV}
              </>
            ) : (
              <>
                <IconSpark />
                {ta.generateATSBtn}
              </>
            )}
          </button>

          {generating && (
            <div className="space-y-1.5 pt-1">
              {[
                ta.generatingStep1 ?? '1. Extrayendo palabras clave de la oferta...',
                ta.generatingStep2 ?? '2. Adaptando CV base al puesto...',
                ta.generatingStep3 ?? '3. Generando CV ATS en inglés...',
              ].map((step, i) => (
                <p key={i} className="flex items-center gap-2 font-mono text-[10px] text-slate-400">
                  <Spinner sm />
                  {step}
                </p>
              ))}
            </div>
          )}
        </div>
      )}

      {hasResult && (
        <div className="space-y-4">
          <div className="flex items-center gap-4 flex-wrap">
            <AtsRing score={atsScore!} />
            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-slate-400">{ta.atsScoreLabel}</p>
              <p className="font-mono text-[10px] text-slate-500 mt-0.5">
                {atsScore! >= 85
                  ? ta.atsExcellent
                  : atsScore! >= 70
                    ? ta.atsGood
                    : ta.atsLow}
              </p>
            </div>
            <button
              onClick={() => {
                setScore(null);
                setGeneratedCv('');
                setSavedAppId(null);
              }}
              className="ml-auto btn-ghost text-[10px] py-1.5 px-3"
            >
              {ta.editBack ?? '← Editar'}
            </button>
          </div>

          <div className="card overflow-hidden">
            <div className="p-4">
              <textarea
                value={generatedCv}
                onChange={(e) => {
                  setGeneratedCv(e.target.value);
                  setIsEdited(true);
                }}
                rows={28}
                className="w-full font-mono text-[10.5px] text-slate-700 dark:text-slate-300 leading-relaxed
                           bg-slate-50 dark:bg-slate-900 rounded-lg p-3
                           border border-slate-200 dark:border-slate-700
                           focus:outline-none focus:ring-2 focus:ring-sky-400/40 focus:border-sky-400
                           resize-y transition-all"
              />
            </div>

            <div className="flex items-center gap-3 flex-wrap px-4 pb-4">
              <button
                onClick={() => printATS(generatedCv, cvLang, form.position, form.company)}
                disabled={!generatedCv}
                className="btn-ghost text-[9.5px] py-1.5 px-3 flex items-center gap-1.5 disabled:opacity-40"
              >
                <IconDownload /> {ta.pdfExport ?? 'Exportar PDF'}
              </button>
              <p className="font-mono text-[9px] text-slate-400">
                {ta.atsCompliantNote ?? 'ATS-friendly · sin tablas ni columnas'}
              </p>
            </div>
          </div>

          {isEdited && (
            <div className="flex items-center gap-2 px-1">
              <IconEdit />
              <span className="font-mono text-[9.5px] text-amber-600 dark:text-amber-400">
                {ta.cvHumanEdited ?? 'Revisado por vos — se guardará tu versión'}
              </span>
            </div>
          )}

          {genError && <p className="font-mono text-[10px] text-rose-500">{genError}</p>}

          <div className="flex flex-wrap items-start gap-3">
            {!savedAppId ? (
              <div className="flex flex-col gap-1">
                <button
                  onClick={save}
                  disabled={saving || !generatedCv}
                  className="btn-primary text-[11px] py-2.5 px-6 flex items-center gap-2 disabled:opacity-40"
                >
                  {saving ? (
                    <>
                      <Spinner sm />
                      {ta.savingBaseCV ?? 'Guardando...'}
                    </>
                  ) : (
                    <>
                      <IconSave />
                      {ta.saveApplication}
                    </>
                  )}
                </button>
                <p className="font-mono text-[9px] text-slate-400 pl-1">
                  {isEdited
                    ? ta.saveAppHintEdited ?? 'Se guardará tu versión editada.'
                    : ta.saveAppHint ?? 'Guardará el CV generado.'}
                </p>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-400/5 border border-emerald-200 dark:border-emerald-400/20">
                <IconCheck />
                <span className="font-mono text-[10px] text-emerald-700 dark:text-emerald-400">
                  {ta.toastAppSaved ?? 'Postulación guardada'}
                </span>
              </div>
            )}

            {savedAppId && (
              <button onClick={finish} className="ml-auto btn-ghost text-[10px] py-2 px-4 flex items-center gap-1.5">
                {ta.doneBtn ?? 'Listo — ver postulaciones →'}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
