import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ApplicationsService } from './applications.service';
import { ApplicationEntity, BaseCvEntity } from './entities/application.entity';
import { esc, extractJson, cleanCvText } from './applications.utils';

describe('ApplicationsService', () => {
  let service: ApplicationsService;
  let appRepo: jest.Mocked<Repository<ApplicationEntity>>;
  let cvRepo: jest.Mocked<Repository<BaseCvEntity>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApplicationsService,
        {
          provide: getRepositoryToken(ApplicationEntity),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            remove: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(BaseCvEntity),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ApplicationsService>(ApplicationsService);
    appRepo = module.get(getRepositoryToken(ApplicationEntity));
    cvRepo = module.get(getRepositoryToken(BaseCvEntity));
  });

  describe('getBaseCV', () => {
    it('should return existing CV', async () => {
      const mockCv = { id: '1', userId: 'user-1', fullName: 'Test' };
      cvRepo.findOne.mockResolvedValue(mockCv as BaseCvEntity);

      const result = await service.getBaseCV('user-1');

      expect(result).toEqual(mockCv);
      expect(cvRepo.findOne).toHaveBeenCalledWith({ where: { userId: 'user-1' } });
    });

    it('should create new CV if not exists', async () => {
      cvRepo.findOne.mockResolvedValue(null);
      cvRepo.create.mockReturnValue({ userId: 'user-1' } as BaseCvEntity);
      cvRepo.save.mockResolvedValue({ userId: 'user-1' } as BaseCvEntity);

      const result = await service.getBaseCV('user-1');

      expect(result.userId).toBe('user-1');
      expect(cvRepo.create).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return all applications for user', async () => {
      const mockApps = [
        { id: '1', userId: 'user-1', company: 'Company A' },
        { id: '2', userId: 'user-1', company: 'Company B' },
      ];
      appRepo.find.mockResolvedValue(mockApps as ApplicationEntity[]);

      const result = await service.findAll('user-1');

      expect(result).toHaveLength(2);
      expect(appRepo.find).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        order: { appliedAt: 'DESC' },
      });
    });
  });

  describe('findOne', () => {
    it('should return application if found', async () => {
      const mockApp = { id: '1', userId: 'user-1', company: 'Company A' };
      appRepo.findOne.mockResolvedValue(mockApp as ApplicationEntity);

      const result = await service.findOne('user-1', '1');

      expect(result).toEqual(mockApp);
    });

    it('should throw NotFoundException if not found', async () => {
      appRepo.findOne.mockResolvedValue(null);

      await expect(service.findOne('user-1', '1')).rejects.toThrow('Application not found');
    });
  });
});

describe('Applications Utils', () => {
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

  describe('extractJson', () => {
    it('should extract valid JSON', () => {
      const result = extractJson<{ name: string }>('{"name": "test"}');
      expect(result?.name).toBe('test');
    });

    it('should extract JSON from markdown', () => {
      const result = extractJson<{ name: string }>('```json\n{"name": "test"}\n```');
      expect(result?.name).toBe('test');
    });

    it('should return null for invalid JSON', () => {
      expect(extractJson('not valid json')).toBeNull();
    });
  });

  describe('cleanCvText', () => {
    it('should remove markdown', () => {
      const dirty = '**bold** *italic* `code` # Header';
      const clean = cleanCvText(dirty);
      expect(clean).toBe('bold italic code Header');
    });

    it('should handle empty string', () => {
      expect(cleanCvText('')).toBe('');
    });
  });
});
