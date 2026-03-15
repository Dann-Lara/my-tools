import { jsPDF } from 'jspdf';

export function printATS(cvText: string, lang: 'es' | 'en', position: string, company: string) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'letter',
  });

  const margin = 50;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const maxWidth = pageWidth - margin * 2;
  let y = margin;

  const SECTION_RX =
    /^(CONTACT(?:O)?|SUMMARY|RESUMEN|EXPERIENCE|EXPERIENCIA|EDUCATION|EDUCACI[OÓ]N|SKILLS|HABILIDADES|LANGUAGES|IDIOMAS|CERTIFICATIONS|CERTIFICACIONES)$/i;
  const ROLE_RX = /^.{3,60}[|–—-].{3,}$/;

  const lines = cvText.split('\n');

  for (const raw of lines) {
    const line = raw.trimEnd();

    if (y > pageHeight - margin - 20) {
      doc.addPage();
      y = margin;
    }

    if (line === '') {
      y += 10;
      continue;
    }

    if (SECTION_RX.test(line.trim())) {
      y += 10;
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(line.trim().toUpperCase(), margin, y);
      y += 20;
    } else if (line.trimStart().startsWith('- ')) {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const bulletText = line.trimStart().slice(2);
      const wrapped = doc.splitTextToSize(bulletText, maxWidth - 20);
      for (const wline of wrapped) {
        if (y > pageHeight - margin) {
          doc.addPage();
          y = margin;
        }
        doc.text('• ' + wline, margin + 15, y);
        y += 14;
      }
    } else if (ROLE_RX.test(line.trim())) {
      y += 5;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      const wrapped = doc.splitTextToSize(line.trim(), maxWidth);
      for (const wline of wrapped) {
        if (y > pageHeight - margin) {
          doc.addPage();
          y = margin;
        }
        doc.text(wline, margin, y);
        y += 14;
      }
    } else {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const wrapped = doc.splitTextToSize(line.trim(), maxWidth);
      for (const wline of wrapped) {
        if (y > pageHeight - margin) {
          doc.addPage();
          y = margin;
        }
        doc.text(wline, margin, y);
        y += 12;
      }
    }
  }

  const year = new Date().getFullYear();
  const fileName = `CV-${company}-${position}-${year}.pdf`;
  doc.save(fileName);
}
