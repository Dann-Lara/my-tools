/**
 * POST /api/applications/extract-cv
 *
 * Receives a base64 PDF from the browser, extracts its text server-side
 * using pdf-parse (no CORS, no direct AI call from browser), then forwards
 * the extracted text to the NestJS backend which calls the AI.
 *
 * Browser  →  Next.js (extract text)  →  NestJS /v1/applications/extract-cv  →  AI
 */
import { type NextRequest, NextResponse } from 'next/server';
import { proxyToBackend } from '../../../../lib/api-proxy';

type PdfParseResult = {
  numpages: number;
  numrender: number;
  info: Record<string, unknown>;
  metadata: Record<string, unknown>;
  text: string;
  version: string;
};

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const { pdfBase64 } = await req.json() as { pdfBase64: string };

    if (!pdfBase64) {
      return NextResponse.json({ error: 'Missing pdfBase64' }, { status: 400 });
    }

    // ── Extract text from PDF server-side ──────────────────────────────────
    let pdfText = '';
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const pdfParse = require('pdf-parse');
      const buffer = Buffer.from(pdfBase64, 'base64');
      const result = await pdfParse(buffer) as PdfParseResult;
      pdfText = (result.text ?? '').trim();
    } catch (pdfErr) {
      console.error('[extract-cv] pdf-parse error:', pdfErr);
      return NextResponse.json(
        { error: 'Could not read PDF. Make sure the file is a valid, non-scanned PDF.' },
        { status: 422 },
      );
    }

    if (!pdfText || pdfText.length < 20) {
      return NextResponse.json(
        { error: 'PDF appears to be empty or image-based (no selectable text). Try a text-based PDF.' },
        { status: 422 },
      );
    }

    // ── Forward to NestJS backend ─────────────────────────────────────────
    return proxyToBackend(req, '/v1/applications/extract-cv', 'POST', { pdfText });
  } catch (err) {
    console.error('[extract-cv] error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
