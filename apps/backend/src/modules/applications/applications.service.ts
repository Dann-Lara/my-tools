import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { generateText } from '@ai-lab/ai-core';
import { withRetry } from '@ai-lab/shared';

import { ApplicationEntity, BaseCvEntity, JobOfferEntity } from './entities/application.entity';
import { esc, extractJson, cleanCvText } from './applications.utils';
import {
  buildGenerateCvPrompts,
  buildAdaptCvToSpanishPrompts,
  buildAnswerInterviewQuestionsPrompts,
  buildExtractCvFromTextPrompts,
  buildEvaluateBaseCVPrompts,
  buildGenerateFeedbackPrompts,
  buildInterviewSimulatorPrompts,
} from './prompts';
import type {
  CreateApplicationDto,
  PatchApplicationDto,
  UpsertBaseCvDto,
  GenerateCvDto,
  ExtractCvDto,
  EvaluateCvDto,
  CvEvaluationResult,
} from './dto/application.dto';

const CV_FIELDS = [
  'fullName',
  'email',
  'phone',
  'location',
  'linkedIn',
  'summary',
  'experience',
  'education',
  'skills',
  'languages',
  'certifications',
] as const;

@Injectable()
export class ApplicationsService {
  private readonly logger = new Logger(ApplicationsService.name);

  constructor(
    @InjectRepository(ApplicationEntity)
    private readonly appRepo: Repository<ApplicationEntity>,
    @InjectRepository(BaseCvEntity)
    private readonly cvRepo: Repository<BaseCvEntity>,
    @InjectRepository(JobOfferEntity)
    private readonly jobOfferRepo: Repository<JobOfferEntity>,
  ) {}

  // ── Base CV ──────────────────────────────────────────────────────────────────

  async getBaseCV(userId: string): Promise<BaseCvEntity> {
    const existing = await this.cvRepo.findOne({ where: { userId } });
    if (existing) return existing;
    return this.cvRepo.create({
      userId,
      fullName: '',
      email: '',
      phone: '',
      location: '',
      linkedIn: '',
      summary: '',
      experience: '',
      education: '',
      skills: '',
      languages: '',
      certifications: '',
    });
  }

  async upsertBaseCV(
    userId: string,
    dto: UpsertBaseCvDto & { cvScore?: number },
  ): Promise<BaseCvEntity> {
    // Enforce minimum quality gate — clients must evaluate before saving
    if (typeof dto.cvScore === 'number' && dto.cvScore < 85) {
      throw new BadRequestException(
        `CV quality score is ${dto.cvScore}/100. A score of at least 85 is required to save.`,
      );
    }
    let entity = await this.cvRepo.findOne({ where: { userId } });
    if (!entity) entity = this.cvRepo.create({ userId });
    const { cvScore: _ignored, ...cvData } = dto;
    Object.assign(entity, cvData);
    return this.cvRepo.save(entity);
  }

  // ── Applications CRUD ─────────────────────────────────────────────────────

  async findAll(userId: string): Promise<ApplicationEntity[]> {
    return this.appRepo.find({ where: { userId }, order: { appliedAt: 'DESC' } });
  }

  async findOne(userId: string, id: string): Promise<ApplicationEntity> {
    const app = await this.appRepo.findOne({ where: { id, userId } });
    if (!app) throw new NotFoundException('Application not found');
    return app;
  }

  async create(userId: string, dto: CreateApplicationDto): Promise<ApplicationEntity> {
    const entity = this.appRepo.create({
      userId,
      company: dto.company,
      position: dto.position,
      jobOfferText: dto.jobOffer,
      status: 'pending',
      atsScore: dto.atsScore,
      cvGenerated: dto.generatedCvText,
      cvGeneratedLang: dto.generatedCvLang,
      appliedFrom: dto.appliedFrom,
    });
    return this.appRepo.save(entity);
  }

  async patch(userId: string, id: string, dto: PatchApplicationDto): Promise<ApplicationEntity> {
    const app = await this.findOne(userId, id);
    if (dto.status !== undefined) app.status = dto.status;
    if (dto.atsScore !== undefined) app.atsScore = dto.atsScore;
    if (dto.generatedCvText !== undefined) {
      app.cvGenerated = dto.generatedCvText;
    }
    if (dto.generatedCvLang !== undefined) {
      app.cvGeneratedLang = dto.generatedCvLang;
    }
    if (dto.appliedFrom !== undefined) app.appliedFrom = dto.appliedFrom;
    if (dto.interviewQuestions !== undefined) app.interviewQuestions = dto.interviewQuestions;
    if (dto.interviewAnswers !== undefined) app.interviewAnswers = dto.interviewAnswers;
    if (dto.interviewGeneratedAt !== undefined) app.interviewGeneratedAt = new Date(dto.interviewGeneratedAt);
    return this.appRepo.save(app);
  }

  async remove(userId: string, id: string): Promise<void> {
    const app = await this.findOne(userId, id);
    await this.appRepo.remove(app);
  }

  // ── AI: Generate dual-language ATS-optimized hybrid CV ─────────────────────

  async generateCv(
    userId: string,
    dto: GenerateCvDto,
  ): Promise<{ atsScore: number; cv: string; lang: 'es' | 'en' }> {
    const baseCV = await this.cvRepo.findOne({ where: { userId } });
    if (!baseCV || !baseCV.fullName || (!baseCV.experience && !baseCV.summary)) {
      throw new BadRequestException(
        'Base CV is incomplete. Please fill in name, email and experience/summary before generating.',
      );
    }

    // ── Build structured candidate profile — NO esc() needed ──────────────
    // We use SystemMessage/HumanMessage directly (no LangChain template parsing),
    // so curly braces in the candidate's text are safe as-is.
    const candidate = [
      `FULL NAME: ${baseCV.fullName}`,
      `EMAIL: ${baseCV.email}`,
      `PHONE: ${baseCV.phone}`,
      `LOCATION: ${baseCV.location}`,
      baseCV.linkedIn ? `LINKEDIN: ${baseCV.linkedIn}` : '',
      '',
      '--- PROFESSIONAL SUMMARY ---',
      baseCV.summary,
      '',
      '--- WORK EXPERIENCE ---',
      baseCV.experience,
      '',
      '--- EDUCATION ---',
      baseCV.education || '(not provided)',
      '',
      '--- TECHNICAL SKILLS ---',
      baseCV.skills || '(not provided)',
      '',
      '--- LANGUAGES ---',
      baseCV.languages || '(not provided)',
      '',
      '--- CERTIFICATIONS ---',
      baseCV.certifications || '(not provided)',
    ]
      .filter((l) => l !== undefined)
      .join('\n');

    const { systemMessage, prompt, detectedLang } = buildGenerateCvPrompts({
      company: dto.company,
      position: dto.position,
      jobOffer: dto.jobOffer,
      candidate,
    });

    this.logger.log(
      `Generating hybrid ATS CV: ${dto.position} @ ${dto.company} for user ${userId}`,
    );

    const result = await withRetry(
      () =>
        generateText({
          prompt,
          systemMessage,
          maxTokens: 6000,
          temperature: 0.3,
        }),
      2,
      2000,
    );

    // ── Parse ===ATS_SCORE:N=== from last line, strip it from CV body ────────
    const raw = result.text.trim();
    const lines = raw.split('\n');

    let atsScore = 80; // fallback
    let cvRaw = raw;

    // Score delimiter can appear anywhere near the end — scan from the bottom
    const scoreLineIdx = lines
      .map((l) => l.trim())
      .reduce<number>((found, line, i) => (/^===ATS_SCORE:\s*\d+===$/.test(line) ? i : found), -1);

    if (scoreLineIdx !== -1) {
      const scoreMatch = lines[scoreLineIdx].match(/ATS_SCORE:\s*(\d+)/i);
      if (scoreMatch) {
        atsScore = Math.min(100, Math.max(0, parseInt(scoreMatch[1], 10)));
      }
      // Everything before the score line is the CV (trim trailing blank lines)
      cvRaw = lines.slice(0, scoreLineIdx).join('\n').trimEnd();
    } else {
      // Fallback: try first-line format (old behavior)
      const firstMatch = lines[0]?.trim().match(/ATS_SCORE:\s*(\d+)/i);
      if (firstMatch) {
        atsScore = Math.min(100, Math.max(0, parseInt(firstMatch[1], 10)));
        cvRaw = lines.slice(1).join('\n').replace(/^\n+/, '');
      } else {
        this.logger.warn(
          `generateCv: ATS_SCORE delimiter not found. Last line: ${lines[lines.length - 1]}`,
        );
      }
    }

    const cvText = cleanCvText(cvRaw);
    if (!cvText || cvText.length < 200) {
      this.logger.error(
        `generateCv: CV too short (${cvText.length} chars). Raw[:300]: ${raw.slice(0, 300)}`,
      );
      throw new Error('AI returned incomplete CV content');
    }

    this.logger.debug(
      `generateCv done: ${result.model} — ${cvText.length} chars — atsScore: ${atsScore} — lang: ${detectedLang}`,
    );
    return { atsScore, cv: cvText, lang: detectedLang };
  }

  // ── AI: Answer interview questions ──────────────────────────────────────────

  async adaptCvToSpanish(userId: string, appId: string): Promise<{ cvEs: string }> {
    const app = await this.findOne(userId, appId);
    if (!app.cvGenerated)
      throw new BadRequestException('No CV saved for this application');

    return { cvEs: app.cvGenerated };
  }

  // ── AI: Answer interview questions ──────────────────────────────────────────

  async answerInterviewQuestions(
    userId: string,
    appId: string,
    questions: string,
    lang: string,
    userRole: string,
  ): Promise<{ answers: string }> {
    const app = await this.findOne(userId, appId);
    const baseCV = await this.cvRepo.findOne({ where: { userId } });

    if (!baseCV) throw new BadRequestException('Base CV not found');
    if (!app.cvGenerated) {
      throw new BadRequestException('No generated CV found for this application');
    }

    const tailoredCv = esc((app.cvGenerated ?? '').slice(0, 3500));

    const { systemMessage, prompt } = buildAnswerInterviewQuestionsPrompts({
      position: esc(app.position),
      company: esc(app.company),
      questions: esc(questions),
      tailoredCv,
      skills: esc((baseCV.skills ?? '').slice(0, 500)),
      languages: esc(baseCV.languages ?? ''),
      certifications: esc((baseCV.certifications ?? '').slice(0, 300)),
      lang: lang ?? 'es',
      userRole,
    });

    return withRetry(
      async () => {
        const { text } = await generateText({
          prompt,
          systemMessage,
          maxTokens: 6000,
          temperature: 0.4,
        });
        // Strip any accidental markdown
        const clean = text
          .replace(/```[a-z]*\n?/gi, '')
          .replace(/```/g, '')
          .trim();
        return { answers: clean };
      },
      2,
      1500,
    );
  }

  // ── AI: Extract CV data from PDF text ────────────────────────────────────

  async extractCvFromText(
    userId: string,
    dto: ExtractCvDto,
  ): Promise<
    Partial<Record<(typeof CV_FIELDS)[number], string>> & { fieldFeedback?: Record<string, string> }
  > {
    if (!dto.pdfText || dto.pdfText.length < 10) {
      throw new BadRequestException('PDF text is too short to extract data from');
    }

    const { systemMessage, prompt } = buildExtractCvFromTextPrompts({
      pdfText: dto.pdfText,
      lang: (dto as any).lang ?? 'es',
    });

    this.logger.log(`Extracting CV for user ${userId} — text length: ${dto.pdfText.length} chars`);

    return withRetry(
      async () => {
        const { text, model } = await generateText({
          prompt,
          systemMessage,
          maxTokens: 3500,
          temperature: 0.05,
        });
        this.logger.debug(`AI model: ${model} — response preview: ${text.slice(0, 150)}`);
        const parsed = extractJson<Record<string, unknown>>(text);
        if (!parsed) {
          this.logger.warn(`Could not extract JSON from: ${text.slice(0, 300)}`);
          throw new Error('AI returned unstructured response');
        }
        const normalized: Record<string, unknown> = {};
        for (const key of CV_FIELDS) {
          normalized[key] = typeof parsed[key] === 'string' ? parsed[key] : '';
        }
        // Pass through fieldFeedback if present (combined extract+evaluate response)
        if (parsed['fieldFeedback'] && typeof parsed['fieldFeedback'] === 'object') {
          normalized['fieldFeedback'] = parsed['fieldFeedback'];
        }
        return normalized as Partial<Record<(typeof CV_FIELDS)[number], string>> & {
          fieldFeedback?: Record<string, string>;
        };
      },
      2,
      2000,
    );
  }

  // ── AI: Evaluate Base CV quality for ATS ─────────────────────────────────
  // Score rubric (to avoid infinite change loops):
  //   summary    20pts — min 3 sentences, must include role + years + value prop
  //   experience 30pts — min 2 roles, each with dates + 2 quantified achievements
  //   skills     15pts — min 6 skills listed
  //   education  10pts — institution + degree + year present
  //   contact    10pts — fullName + email + phone + location all present
  //   languages   5pts — at least one language with level
  //   certifications 5pts — at least one entry
  //   linkedIn    5pts — URL present and looks valid
  // Total: 100pts. Approved when >= 85.
  async evaluateBaseCV(dto: EvaluateCvDto): Promise<CvEvaluationResult> {
    const isEs = (dto.lang ?? 'es') === 'es';
    const lang = isEs ? 'Spanish' : 'English';
    const approved = dto.approvedFields ?? [];

    const WEIGHTS: Record<string, number> = {
      contact: 10,
      linkedIn: 5,
      summary: 20,
      experience: 30,
      skills: 15,
      education: 10,
      languages: 5,
      certifications: 5,
    };
    const ALL_FIELDS = Object.keys(WEIGHTS);

    if (ALL_FIELDS.every((k) => approved.includes(k))) {
      const ff: Record<string, string> = {};
      ALL_FIELDS.forEach((k) => {
        ff[k] = '';
      });
      return { score: 100, approved: true, summary: '', fieldFeedback: ff };
    }

    const { systemMessage, prompt } = buildEvaluateBaseCVPrompts({
      fullName: esc(dto.fullName),
      email: esc(dto.email),
      phone: esc(dto.phone ?? ''),
      location: esc(dto.location ?? ''),
      linkedIn: esc(dto.linkedIn ?? ''),
      summary: esc(dto.summary ?? ''),
      experience: esc(dto.experience ?? ''),
      education: esc(dto.education ?? ''),
      skills: esc(dto.skills ?? ''),
      languages: esc(dto.languages ?? ''),
      certifications: esc(dto.certifications ?? ''),
      lang,
      approvedFields: approved,
    });

    const ffTemplate: Record<string, string> = {};
    ALL_FIELDS.forEach((k) => {
      ffTemplate[k] = '';
    });

    return withRetry(
      async () => {
        const { text } = await generateText({
          prompt,
          systemMessage,
          maxTokens: 500,
          temperature: 0,
        });

        this.logger.debug('[evaluateBaseCV] raw: ' + text.slice(0, 400));

        const parsed = extractJson<CvEvaluationResult>(text);

        if (!parsed) {
          const m = text.match(/"score"\s*:\s*(\d+)/);
          if (m) {
            const score = Math.min(100, Math.max(0, parseInt(m[1], 10)));
            this.logger.warn('[evaluateBaseCV] salvaged score=' + score);
            return { score, approved: score >= 85, summary: '', fieldFeedback: ffTemplate };
          }
          this.logger.error('[evaluateBaseCV] unparseable: ' + text.slice(0, 300));
          throw new Error('AI returned unparseable evaluation response');
        }

        if (typeof parsed.score !== 'number') throw new Error('AI evaluation missing score field');

        // Enforce: frozen fields must always have empty feedback
        const ff =
          parsed.fieldFeedback && typeof parsed.fieldFeedback === 'object'
            ? { ...ffTemplate, ...parsed.fieldFeedback }
            : { ...ffTemplate };
        approved.forEach((k) => {
          ff[k] = '';
        });

        return {
          score: Math.min(100, Math.max(0, Math.round(parsed.score))),
          approved: parsed.score >= 85,
          summary: typeof parsed.summary === 'string' ? parsed.summary : '',
          fieldFeedback: ff,
        };
      },
      2,
      1500,
    );
  }

  // ── AI: Job search coaching feedback ─────────────────────────────────────

  async generateFeedback(userId: string): Promise<{ feedback: string }> {
    const apps = await this.findAll(userId);
    if (apps.length < 2) {
      throw new BadRequestException('Need at least 2 applications to generate feedback');
    }

    const total = apps.length;
    const accepted = apps.filter((a) => a.status === 'accepted').length;
    const rejected = apps.filter((a) => a.status === 'rejected').length;
    const pending = apps.filter((a) => a.status === 'pending' || a.status === 'in_process').length;
    const acceptRate = Math.round((accepted / total) * 100);
    const withAts = apps.filter((a) => a.atsScore != null);
    const avgAts = withAts.length
      ? Math.round(withAts.reduce((s, a) => s + (a.atsScore ?? 0), 0) / withAts.length)
      : 0;
    const companies = apps.map((a) => esc(a.company) + ' (' + esc(a.position) + ')').join(', ');

    const { systemMessage, prompt } = buildGenerateFeedbackPrompts({
      total,
      accepted,
      rejected,
      pending,
      acceptRate,
      avgAts,
      companies,
    });

    const { text } = await withRetry(
      () => generateText({ prompt, systemMessage, maxTokens: 400, temperature: 0.6 }),
      2,
      1500,
    );

    return { feedback: text.trim() };
  }

  // ── AI: Interview Simulator ─────────────────────────────────────────────────

  async generateInterviewSimulator(
    userId: string,
    appId: string,
    lang: string,
  ): Promise<{ questions: { question: string; answer: string }[] }> {
    const app = await this.findOne(userId, appId);
    const baseCV = await this.cvRepo.findOne({ where: { userId } });

    if (!baseCV) throw new BadRequestException('Base CV not found');
    if (!app.cvGenerated) {
      throw new BadRequestException('No generated CV found for this application');
    }

    const { systemMessage, prompt } = buildInterviewSimulatorPrompts({
      position: app.position,
      company: app.company,
      jobDescription: app.jobOfferText ?? '',
      tailoredCv: app.cvGenerated ?? '',
      skills: baseCV.skills,
      languages: baseCV.languages,
      certifications: baseCV.certifications,
      lang,
    });

    this.logger.log(`Generating interview simulator: ${app.position} @ ${app.company}`);

    const result = await withRetry(
      async () =>
        generateText({
          prompt,
          systemMessage,
          maxTokens: 8000,
          temperature: 0.5,
        }),
      2,
      2000,
    );

    const parsed = extractJson<{ questions: { question: string; answer: string }[] }>(result.text);

    if (!parsed || !parsed.questions || !Array.isArray(parsed.questions)) {
      this.logger.error('[interviewSimulator] unparseable: ' + result.text.slice(0, 300));
      throw new Error('AI returned unparseable interview response');
    }

    // Save to application
    const questionsText = parsed.questions.map((q, i) => `${i + 1}. ${q.question}`).join('\n');
    const answersText = parsed.questions.map((q) => q.answer).join('\n\n');

    await this.appRepo.update(
      { id: appId, userId },
      {
        interviewQuestions: questionsText,
        interviewAnswers: answersText,
        interviewGeneratedAt: new Date(),
      },
    );

    return { questions: parsed.questions };
  }
}
