import { Test, type TestingModule } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import { ApplicationsController } from './applications.controller';
import { ApplicationsService } from './applications.service';
import { UsersService } from '../users/users.service';

describe('ApplicationsController', () => {
  let controller: ApplicationsController;
  let service: jest.Mocked<ApplicationsService>;

  const mockUser = { userId: 'user-1', role: 'client' };

  const mockApplication = {
    id: 'app-1',
    userId: 'user-1',
    company: 'Tech Corp',
    position: 'Frontend Developer',
    jobOfferText: 'Looking for a React developer...',
    status: 'pending' as const,
    atsScore: 85,
    cvGenerated: 'Generated CV text',
    cvGeneratedLang: 'en' as const,
    appliedFrom: 'LinkedIn',
    appliedAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ApplicationsController],
      providers: [
        {
          provide: ApplicationsService,
          useValue: {
            findAll: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            patch: jest.fn(),
            remove: jest.fn(),
            generateCv: jest.fn(),
            adaptCvToSpanish: jest.fn(),
            getBaseCV: jest.fn(),
            upsertBaseCV: jest.fn(),
            evaluateBaseCV: jest.fn(),
            evaluateCv: jest.fn(),
            generateInterviewAnswers: jest.fn(),
            generateInterviewSimulator: jest.fn(),
            translateCv: jest.fn(),
            deleteApplication: jest.fn(),
          },
        },
        {
          provide: UsersService,
          useValue: {
            findById: jest.fn(),
          },
        },
        {
          provide: Reflector,
          useValue: {
            get: jest.fn(),
            getAllAndOverride: jest.fn().mockReturnValue('applications'),
          },
        },
      ],
    })
      .overrideGuard('JwtAuthGuard')
      .useValue({ canActivate: () => true })
      .overrideGuard('PermissionGuard')
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<ApplicationsController>(ApplicationsController);
    service = module.get(ApplicationsService);
  });

  describe('findOne', () => {
    it('should return application with jobOffer mapped from jobOfferText', async () => {
      service.findOne.mockResolvedValue(mockApplication as any);

      const result = await controller.findOne(mockUser as any, 'app-1');

      expect(service.findOne).toHaveBeenCalledWith('user-1', 'app-1');
      expect(result).toHaveProperty('jobOffer');
      expect(result.jobOffer).toBe('Looking for a React developer...');
    });

    it('should handle missing jobOfferText', async () => {
      const appWithoutJobOffer = { ...mockApplication, jobOfferText: undefined };
      service.findOne.mockResolvedValue(appWithoutJobOffer as any);

      const result = await controller.findOne(mockUser as any, 'app-1');

      expect(result.jobOffer).toBeUndefined();
    });
  });

  describe('findAll', () => {
    it('should return all applications with jobOffer mapped', async () => {
      const mockApps = [mockApplication, { ...mockApplication, id: 'app-2' }];
      service.findAll.mockResolvedValue(mockApps as any);

      const result = await controller.findAll(mockUser as any);

      expect(service.findAll).toHaveBeenCalledWith('user-1');
      expect(result).toHaveLength(2);
      expect(result[0]).toHaveProperty('jobOffer');
      expect(result[1]).toHaveProperty('jobOffer');
    });
  });
});
