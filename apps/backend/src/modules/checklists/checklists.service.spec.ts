import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ChecklistsService } from './checklists.service';
import {
  ChecklistEntity,
  ChecklistItemEntity,
  ChecklistFeedbackEntity,
} from './entities/checklist.entity';
import { esc, validateAiResponse, parseAiJson } from './checklists.utils';

describe('ChecklistsService', () => {
  let service: ChecklistsService;
  let checklistRepo: jest.Mocked<Repository<ChecklistEntity>>;
  let itemRepo: jest.Mocked<Repository<ChecklistItemEntity>>;
  let feedbackRepo: jest.Mocked<Repository<ChecklistFeedbackEntity>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChecklistsService,
        {
          provide: getRepositoryToken(ChecklistEntity),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            remove: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(ChecklistItemEntity),
          useValue: {
            find: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(ChecklistFeedbackEntity),
          useValue: {
            find: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ChecklistsService>(ChecklistsService);
    checklistRepo = module.get(getRepositoryToken(ChecklistEntity));
    itemRepo = module.get(getRepositoryToken(ChecklistItemEntity));
    feedbackRepo = module.get(getRepositoryToken(ChecklistFeedbackEntity));
  });

  describe('findAll', () => {
    it('should return all checklists for user', async () => {
      const mockChecklists = [
        { id: '1', userId: 'user-1', title: 'Checklist A' },
        { id: '2', userId: 'user-1', title: 'Checklist B' },
      ];
      checklistRepo.find.mockResolvedValue(mockChecklists as ChecklistEntity[]);

      const result = await service.findAll('user-1');

      expect(result).toHaveLength(2);
      expect(checklistRepo.find).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        relations: ['items'],
        order: { createdAt: 'DESC' },
      });
    });
  });

  describe('findOne', () => {
    it('should return checklist if found', async () => {
      const mockChecklist = { id: '1', userId: 'user-1', title: 'Test' };
      checklistRepo.findOne.mockResolvedValue(mockChecklist as ChecklistEntity);

      const result = await service.findOne('user-1', '1');

      expect(result).toEqual(mockChecklist);
    });

    it('should throw NotFoundException if not found', async () => {
      checklistRepo.findOne.mockResolvedValue(null);

      await expect(service.findOne('user-1', '1')).rejects.toThrow('Checklist not found');
    });
  });
});

describe('Checklists Utils', () => {
  describe('esc', () => {
    it('should escape curly braces', () => {
      expect(esc('test {variable}')).toBe('test (variable)');
      expect(esc('{nested {braces}}')).toBe('(nested (braces))');
    });

    it('should handle null/undefined', () => {
      expect(esc(null as any)).toBe('');
      expect(esc(undefined as any)).toBe('');
    });
  });

  describe('validateAiResponse', () => {
    it('should validate valid response', () => {
      const valid = {
        items: [
          { description: 'Task 1', frequency: 'daily', estimatedDuration: 15, hack: 'Do it fast' },
        ],
      };
      expect(validateAiResponse(valid)).toEqual(valid);
    });

    it('should throw for missing items', () => {
      expect(() => validateAiResponse({})).toThrow('Missing or empty items array');
    });

    it('should throw for invalid frequency', () => {
      const invalid = {
        items: [
          { description: 'Task 1', frequency: 'invalid', estimatedDuration: 15, hack: 'Hack' },
        ],
      };
      expect(() => validateAiResponse(invalid)).toThrow('Invalid frequency');
    });
  });

  describe('parseAiJson', () => {
    it('should parse valid JSON', () => {
      const json =
        '{"items":[{"description":"Test","frequency":"daily","estimatedDuration":15,"hack":"Hack"}]}';
      const result = parseAiJson(json);
      expect(result.items).toHaveLength(1);
      expect(result.items[0].description).toBe('Test');
    });

    it('should handle markdown fences', () => {
      const json =
        '```json\n{"items":[{"description":"Test","frequency":"daily","estimatedDuration":15,"hack":"Hack"}]}\n```';
      const result = parseAiJson(json);
      expect(result.items).toHaveLength(1);
    });

    it('should throw for invalid JSON', () => {
      expect(() => parseAiJson('not valid json')).toThrow('No JSON object found');
    });
  });
});
