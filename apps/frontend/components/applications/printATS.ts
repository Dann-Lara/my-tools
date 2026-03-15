export function printATS(cvText: string, lang: 'es' | 'en', position: string, company: string) {
  const win = window.open('', '_blank');
  if (!win) return;

  const SECTION_RX =
    /^(CONTACT(?:O)?|SUMMARY|RESUMEN|EXPERIENCE|EXPERIENCIA|EDUCATION|EDUCACI[OÓ]N|SKILLS|HABILIDADES|LANGUAGES|IDIOMAS|CERTIFICATIONS|CERTIFICACIONES)$/i;
  const ROLE_RX = /^.{3,60}[|–—-].{3,}$/;

  const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  const htmlLines: string[] = [];
  for (const raw of cvText.split('\n')) {
    const line = raw.trimEnd();
    if (line === '') {
      htmlLines.push('<div class="gap"></div>');
    } else if (SECTION_RX.test(line.trim())) {
      htmlLines.push(`<h2>${esc(line.trim())}</h2>`);
    } else if (line.trimStart().startsWith('- ')) {
      htmlLines.push(`<p class="bullet">${esc(line.trimStart().slice(2))}</p>`);
    } else if (ROLE_RX.test(line.trim())) {
      htmlLines.push(`<p class="role">${esc(line.trim())}</p>`);
    } else {
      htmlLines.push(`<p>${esc(line.trim())}</p>`);
    }
  }

  win.document.write(`<!DOCTYPE html>
<html lang="${lang}"><head><meta charset="UTF-8"/><title></title>
<style>
@page { margin: 0.6in 0.5in; size: Letter; }
* { box-sizing: border-box; margin: 0; padding: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
body { font-family: Arial, Helvetica, sans-serif; font-size: 11pt; line-height: 1.5; color: #000; background: #fff; padding: 0; margin: 0; }
h2 { font-size: 12pt; font-weight: bold; text-transform: uppercase; letter-spacing: 0.05em; margin-top: 14pt; margin-bottom: 6pt; break-after: avoid; page-break-after: avoid; }
p { margin-bottom: 4pt; break-inside: avoid; }
p.role { font-weight: bold; margin-top: 8pt; margin-bottom: 2pt; break-after: avoid; page-break-after: avoid; }
p.bullet { padding-left: 18pt; text-indent: -18pt; }
p.bullet::before { content: "- "; }
div.gap { height: 6pt; }
</style></head>
<body>${htmlLines.join('\n')}</body></html>`);
  win.document.close();
  win.addEventListener('load', () => {
    win.focus();
    win.print();
    win.close();
  });
}
