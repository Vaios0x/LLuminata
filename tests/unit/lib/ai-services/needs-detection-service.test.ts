import { needsDetectionService, InteractionData } from '@/lib/ai-services/needs-detection-service';
import { PrismaClient } from '@prisma/client';

// Mock Prisma
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    specialNeed: {
      create: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
    student: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    assessment: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
    $disconnect: jest.fn(),
  })),
}));

// Mock OpenAI
jest.mock('openai', () => ({
  OpenAI: jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: jest.fn(),
      },
    },
  })),
}));

// Mock Anthropic
jest.mock('@anthropic-ai/sdk', () => ({
  Anthropic: jest.fn().mockImplementation(() => ({
    messages: {
      create: jest.fn(),
    },
  })),
}));

describe('Needs Detection Service', () => {
  let mockPrisma: any;
  let mockOpenAI: any;
  let mockAnthropic: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockPrisma = new PrismaClient();
    mockOpenAI = require('openai');
    mockAnthropic = require('@anthropic-ai/sdk');
  });

  describe('analyzeNeeds', () => {
    const mockInteractionData: InteractionData = {
      readingSpeed: 0.3,
      readingAccuracy: 0.85,
      readingComprehension: 0.78,
      mathAccuracy: 0.92,
      mathSpeed: 0.88,
      attentionSpan: 0.65,
      taskCompletion: 0.72,
      helpRequests: 0.45,
      audioPreference: 0.6,
      visualPreference: 0.3,
      kinestheticPreference: 0.1,
      readingErrors: {
        substitutions: 15,
        omissions: 8,
        insertions: 3,
        reversals: 12,
        transpositions: 5,
      },
      mathErrors: {
        calculation: 5,
        procedural: 8,
        conceptual: 12,
        visual: 3,
      },
      responseTime: {
        mean: 2.5,
        variance: 0.8,
        outliers: 3,
      },
      language: 'es-MX',
      culturalBackground: 'maya',
      socioeconomicContext: 'rural',
      previousEducation: 2,
      sessionDuration: 1800,
      breaksTaken: 2,
      internetSpeed: 512,
      offlineUsage: 0.3,
      deviceType: 'mobile',
    };

    it('should detect dyslexia correctly', async () => {
      // Mock AI response for dyslexia detection
      mockAnthropic.Anthropic.mockImplementation(() => ({
        messages: {
          create: jest.fn().mockResolvedValue({
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  specialNeeds: [
                    {
                      type: 'DYSLEXIA',
                      severity: 'moderate',
                      confidence: 0.87,
                      indicators: ['reversals', 'slow_reading', 'substitutions'],
                      recommendations: ['use_audio', 'larger_font', 'color_overlays'],
                    },
                  ],
                  learningProfile: {
                    learningStyle: 'auditory',
                    pace: 'slow',
                    strengths: ['listening', 'creativity'],
                    challenges: ['reading_speed', 'spelling', 'word_recognition'],
                  },
                  culturalAdaptations: {
                    languageSupport: ['maya_translations'],
                    culturalRelevance: ['local_examples'],
                    communityIntegration: ['family_involvement'],
                  },
                }),
              },
            ],
          }),
        },
      }));

      const result = await needsDetectionService.analyzeNeeds('student-1', mockInteractionData);

      expect(result.specialNeeds).toHaveLength(1);
      expect(result.specialNeeds[0].type).toBe('DYSLEXIA');
      expect(result.specialNeeds[0].severity).toBe('moderate');
      expect(result.specialNeeds[0].confidence).toBeGreaterThan(0.8);
      expect(result.learningProfile.learningStyle).toBe('auditory');
    });

    it('should detect ADHD correctly', async () => {
      const adhdData = {
        ...mockInteractionData,
        attentionSpan: 0.25,
        taskCompletion: 0.35,
        helpRequests: 0.85,
        responseTime: {
          mean: 4.2,
          variance: 2.1,
          outliers: 8,
        },
      };

      mockAnthropic.Anthropic.mockImplementation(() => ({
        messages: {
          create: jest.fn().mockResolvedValue({
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  specialNeeds: [
                    {
                      type: 'ADHD',
                      severity: 'mild',
                      confidence: 0.82,
                      indicators: ['short_attention', 'task_switching', 'impulsivity'],
                      recommendations: ['frequent_breaks', 'clear_structure', 'movement_breaks'],
                    },
                  ],
                  learningProfile: {
                    learningStyle: 'kinesthetic',
                    pace: 'variable',
                    strengths: ['creativity', 'energy'],
                    challenges: ['sustained_attention', 'organization', 'time_management'],
                  },
                }),
              },
            ],
          }),
        },
      }));

      const result = await needsDetectionService.analyzeNeeds('student-2', adhdData);

      expect(result.specialNeeds).toHaveLength(1);
      expect(result.specialNeeds[0].type).toBe('ADHD');
      expect(result.specialNeeds[0].severity).toBe('mild');
      expect(result.learningProfile.learningStyle).toBe('kinesthetic');
    });

    it('should detect multiple needs', async () => {
      const multipleNeedsData = {
        ...mockInteractionData,
        readingSpeed: 0.2,
        attentionSpan: 0.3,
        mathAccuracy: 0.45,
      };

      mockAnthropic.Anthropic.mockImplementation(() => ({
        messages: {
          create: jest.fn().mockResolvedValue({
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  specialNeeds: [
                    {
                      type: 'DYSLEXIA',
                      severity: 'moderate',
                      confidence: 0.85,
                      indicators: ['reversals', 'slow_reading'],
                      recommendations: ['use_audio', 'larger_font'],
                    },
                    {
                      type: 'DYSCALCULIA',
                      severity: 'mild',
                      confidence: 0.78,
                      indicators: ['calculation_errors', 'number_confusion'],
                      recommendations: ['visual_math', 'concrete_examples'],
                    },
                  ],
                  learningProfile: {
                    learningStyle: 'visual',
                    pace: 'slow',
                    strengths: ['creativity', 'spatial_reasoning'],
                    challenges: ['reading', 'math', 'attention'],
                  },
                }),
              },
            ],
          }),
        },
      }));

      const result = await needsDetectionService.analyzeNeeds('student-3', multipleNeedsData);

      expect(result.specialNeeds).toHaveLength(2);
      expect(result.specialNeeds.map(n => n.type)).toContain('DYSLEXIA');
      expect(result.specialNeeds.map(n => n.type)).toContain('DYSCALCULIA');
    });

    it('should handle cultural adaptations', async () => {
      const culturalData = {
        ...mockInteractionData,
        culturalBackground: 'nahuatl',
        language: 'nahuatl',
        socioeconomicContext: 'indigenous_rural',
      };

      mockAnthropic.Anthropic.mockImplementation(() => ({
        messages: {
          create: jest.fn().mockResolvedValue({
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  specialNeeds: [],
                  learningProfile: {
                    learningStyle: 'visual',
                    pace: 'moderate',
                    strengths: ['oral_tradition', 'community_learning'],
                    challenges: ['formal_education', 'digital_literacy'],
                  },
                  culturalAdaptations: {
                    languageSupport: ['nahuatl_primary', 'spanish_secondary'],
                    culturalRelevance: ['indigenous_examples', 'community_stories'],
                    communityIntegration: ['elder_participation', 'cultural_ceremonies'],
                    traditionalLearning: ['oral_storytelling', 'practical_skills'],
                  },
                }),
              },
            ],
          }),
        },
      }));

      const result = await needsDetectionService.analyzeNeeds('student-4', culturalData);

      expect(result.culturalAdaptations.languageSupport).toContain('nahuatl_primary');
      expect(result.culturalAdaptations.culturalRelevance).toContain('indigenous_examples');
      expect(result.learningProfile.strengths).toContain('oral_tradition');
    });

    it('should handle AI service errors gracefully', async () => {
      mockAnthropic.Anthropic.mockImplementation(() => ({
        messages: {
          create: jest.fn().mockRejectedValue(new Error('AI Service Error')),
        },
      }));

      await expect(
        needsDetectionService.analyzeNeeds('student-5', mockInteractionData)
      ).rejects.toThrow('Error analyzing needs with AI');
    });

    it('should handle invalid AI responses', async () => {
      mockAnthropic.Anthropic.mockImplementation(() => ({
        messages: {
          create: jest.fn().mockResolvedValue({
            content: [
              {
                type: 'text',
                text: 'Invalid JSON response',
              },
            ],
          }),
        },
      }));

      await expect(
        needsDetectionService.analyzeNeeds('student-6', mockInteractionData)
      ).rejects.toThrow('Error parsing AI response');
    });

    it('should save results to database', async () => {
      mockAnthropic.Anthropic.mockImplementation(() => ({
        messages: {
          create: jest.fn().mockResolvedValue({
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  specialNeeds: [
                    {
                      type: 'DYSLEXIA',
                      severity: 'mild',
                      confidence: 0.85,
                      indicators: ['reversals'],
                      recommendations: ['use_audio'],
                    },
                  ],
                  learningProfile: {
                    learningStyle: 'auditory',
                    pace: 'moderate',
                    strengths: ['listening'],
                    challenges: ['reading'],
                  },
                }),
              },
            ],
          }),
        },
      }));

      mockPrisma.specialNeed.create.mockResolvedValue({
        id: 'need-1',
        studentId: 'student-1',
        type: 'DYSLEXIA',
        severity: 1,
        detectedAt: new Date(),
        detectionMethod: 'AI',
        recommendations: { recommendations: ['use_audio'] },
      });

      mockPrisma.student.update.mockResolvedValue({
        id: 'student-1',
        learningProfile: { learningStyle: 'auditory' },
      });

      const result = await needsDetectionService.analyzeNeeds('student-1', mockInteractionData);

      expect(mockPrisma.specialNeed.create).toHaveBeenCalledWith({
        data: {
          studentId: 'student-1',
          type: 'DYSLEXIA',
          severity: 1,
          detectionMethod: 'AI',
          recommendations: { recommendations: ['use_audio'] },
        },
      });

      expect(mockPrisma.student.update).toHaveBeenCalledWith({
        where: { id: 'student-1' },
        data: {
          learningProfile: { learningStyle: 'auditory' },
        },
      });
    });
  });

  describe('getHistoricalAnalysis', () => {
    it('should retrieve historical analysis', async () => {
      const mockSpecialNeeds = [
        {
          id: 'need-1',
          type: 'DYSLEXIA',
          severity: 2,
          detectedAt: new Date('2025-01-01'),
          detectionMethod: 'AI',
          recommendations: { recommendations: ['use_audio'] },
        },
      ];

      const mockStudent = {
        id: 'student-1',
        learningProfile: { learningStyle: 'auditory' },
      };

      const mockAssessments = [
        {
          id: 'assessment-1',
          type: 'INITIAL',
          score: 75,
          conductedAt: new Date('2025-01-01'),
        },
      ];

      mockPrisma.specialNeed.findMany.mockResolvedValue(mockSpecialNeeds);
      mockPrisma.student.findUnique.mockResolvedValue(mockStudent);
      mockPrisma.assessment.findMany.mockResolvedValue(mockAssessments);

      const result = await needsDetectionService.getHistoricalAnalysis('student-1');

      expect(result.specialNeeds).toEqual(mockSpecialNeeds);
      expect(result.learningProfile).toEqual(mockStudent.learningProfile);
      expect(result.recentAssessments).toEqual(mockAssessments);
    });

    it('should handle database errors', async () => {
      mockPrisma.specialNeed.findMany.mockRejectedValue(new Error('Database Error'));

      await expect(
        needsDetectionService.getHistoricalAnalysis('student-1')
      ).rejects.toThrow('Error retrieving historical analysis');
    });
  });

  describe('validateInteractionData', () => {
    it('should validate correct interaction data', () => {
      const validData: InteractionData = {
        readingSpeed: 0.5,
        readingAccuracy: 0.8,
        readingComprehension: 0.7,
        mathAccuracy: 0.9,
        mathSpeed: 0.8,
        attentionSpan: 0.6,
        taskCompletion: 0.7,
        helpRequests: 0.3,
        audioPreference: 0.4,
        visualPreference: 0.4,
        kinestheticPreference: 0.2,
        readingErrors: {
          substitutions: 10,
          omissions: 5,
          insertions: 2,
          reversals: 8,
          transpositions: 3,
        },
        mathErrors: {
          calculation: 3,
          procedural: 5,
          conceptual: 7,
          visual: 2,
        },
        responseTime: {
          mean: 2.0,
          variance: 0.5,
          outliers: 2,
        },
        language: 'es-MX',
        culturalBackground: 'maya',
        socioeconomicContext: 'rural',
      };

      const result = needsDetectionService.validateInteractionData(validData);
      expect(result).toBe(true);
    });

    it('should reject invalid reading speed', () => {
      const invalidData = {
        ...mockInteractionData,
        readingSpeed: -0.1,
      };

      const result = needsDetectionService.validateInteractionData(invalidData);
      expect(result).toBe(false);
    });

    it('should reject invalid reading errors', () => {
      const invalidData = {
        ...mockInteractionData,
        readingErrors: {
          substitutions: -5,
          omissions: 5,
          insertions: 2,
          reversals: 8,
          transpositions: 3,
        },
      };

      const result = needsDetectionService.validateInteractionData(invalidData);
      expect(result).toBe(false);
    });

    it('should reject missing required fields', () => {
      const invalidData = {
        readingSpeed: 0.5,
        // Missing other required fields
      } as any;

      const result = needsDetectionService.validateInteractionData(invalidData);
      expect(result).toBe(false);
    });

    it('should normalize sensory preferences', () => {
      const unnormalizedData = {
        ...mockInteractionData,
        audioPreference: 0.8,
        visualPreference: 0.6,
        kinestheticPreference: 0.4,
      };

      const result = needsDetectionService.validateInteractionData(unnormalizedData);
      expect(result).toBe(true);
    });
  });

  describe('generateRecommendations', () => {
    it('should generate dyslexia recommendations', () => {
      const dyslexiaNeeds = [
        {
          type: 'DYSLEXIA',
          severity: 'moderate',
          confidence: 0.85,
          indicators: ['reversals', 'slow_reading'],
          recommendations: ['use_audio', 'larger_font'],
        },
      ];

      const recommendations = needsDetectionService.generateRecommendations(dyslexiaNeeds);

      expect(recommendations).toContain('use_audio');
      expect(recommendations).toContain('larger_font');
      expect(recommendations).toContain('color_overlays');
      expect(recommendations).toContain('text_to_speech');
    });

    it('should generate ADHD recommendations', () => {
      const adhdNeeds = [
        {
          type: 'ADHD',
          severity: 'mild',
          confidence: 0.82,
          indicators: ['short_attention', 'task_switching'],
          recommendations: ['frequent_breaks', 'clear_structure'],
        },
      ];

      const recommendations = needsDetectionService.generateRecommendations(adhdNeeds);

      expect(recommendations).toContain('frequent_breaks');
      expect(recommendations).toContain('clear_structure');
      expect(recommendations).toContain('movement_breaks');
      expect(recommendations).toContain('visual_timers');
    });

    it('should generate cultural recommendations', () => {
      const culturalContext = {
        language: 'maya',
        culturalBackground: 'indigenous',
        socioeconomicContext: 'rural',
      };

      const recommendations = needsDetectionService.generateCulturalRecommendations(culturalContext);

      expect(recommendations).toContain('maya_translations');
      expect(recommendations).toContain('local_examples');
      expect(recommendations).toContain('community_integration');
      expect(recommendations).toContain('offline_content');
    });
  });

  describe('Performance and Edge Cases', () => {
    it('should handle large datasets efficiently', async () => {
      const largeData = {
        ...mockInteractionData,
        readingErrors: {
          substitutions: 1000,
          omissions: 500,
          insertions: 200,
          reversals: 800,
          transpositions: 300,
        },
      };

      const startTime = performance.now();
      
      mockAnthropic.Anthropic.mockImplementation(() => ({
        messages: {
          create: jest.fn().mockResolvedValue({
            content: [{ type: 'text', text: JSON.stringify({ specialNeeds: [] }) }],
          }),
        },
      }));

      await needsDetectionService.analyzeNeeds('student-large', largeData);
      
      const endTime = performance.now();
      expect(endTime - startTime).toBeLessThan(1000); // Should process in less than 1 second
    });

    it('should handle concurrent requests', async () => {
      const promises = [];
      
      mockAnthropic.Anthropic.mockImplementation(() => ({
        messages: {
          create: jest.fn().mockResolvedValue({
            content: [{ type: 'text', text: JSON.stringify({ specialNeeds: [] }) }],
          }),
        },
      }));

      for (let i = 0; i < 10; i++) {
        promises.push(needsDetectionService.analyzeNeeds(`student-${i}`, mockInteractionData));
      }

      const results = await Promise.all(promises);
      expect(results).toHaveLength(10);
    });

    it('should handle network timeouts', async () => {
      mockAnthropic.Anthropic.mockImplementation(() => ({
        messages: {
          create: jest.fn().mockRejectedValue(new Error('Network timeout')),
        },
      }));

      await expect(
        needsDetectionService.analyzeNeeds('student-timeout', mockInteractionData)
      ).rejects.toThrow('Error analyzing needs with AI');
    });
  });
});
