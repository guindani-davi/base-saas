import { Environment } from '@base-saas/shared';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { HelpersService } from './helpers.service';

describe('HelpersService', () => {
  let helpersService: HelpersService;
  let configService: ConfigService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [HelpersService],
    })
      .useMocker((token) => {
        if (token === ConfigService) {
          return {
            getOrThrow: vi.fn(),
          };
        }
      })
      .compile();

    helpersService = moduleRef.get(HelpersService);
    configService = moduleRef.get(ConfigService);
  });

  describe('parseDate', () => {
    it('should parse ISO date string to Date object', () => {
      const dateString = '2026-05-01T12:00:00.000Z';

      const result = helpersService.parseDate(dateString);

      expect(result).toBeInstanceOf(Date);
      expect(result.toISOString()).toBe(dateString);
    });

    it('should parse date without time', () => {
      const dateString = '2026-05-01';

      const result = helpersService.parseDate(dateString);

      expect(result).toBeInstanceOf(Date);
      expect(result.getUTCFullYear()).toBe(2026);
      expect(result.getUTCMonth()).toBe(4);
      expect(result.getUTCDate()).toBe(1);
    });
  });

  describe('getCurrentTimestamp', () => {
    it('should return timestamp with Z suffix', () => {
      const result = helpersService.getCurrentTimestamp();

      expect(result).toContain('Z');
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });

    it('should return valid ISO format', () => {
      const result = helpersService.getCurrentTimestamp();

      const date = new Date(result);
      expect(date).toBeInstanceOf(Date);
      expect(isNaN(date.getTime())).toBe(false);
    });
  });

  describe('generateUUID', () => {
    it('should return a valid UUID string', () => {
      const result = helpersService.generateUUID();

      expect(result).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
      );
    });

    it('should generate unique UUIDs', () => {
      const uuid1 = helpersService.generateUUID();
      const uuid2 = helpersService.generateUUID();

      expect(uuid1).not.toBe(uuid2);
    });
  });

  describe('isProduction', () => {
    it('should return true when NODE_ENV is production', () => {
      vi.spyOn(configService, 'getOrThrow').mockReturnValue(
        Environment.PRODUCTION,
      );

      const result = helpersService.isProduction();

      expect(result).toBe(true);
      expect(configService.getOrThrow).toHaveBeenCalledWith('NODE_ENV');
    });

    it('should return false when NODE_ENV is preview', () => {
      vi.spyOn(configService, 'getOrThrow').mockReturnValue(
        Environment.PREVIEW,
      );

      const result = helpersService.isProduction();

      expect(result).toBe(false);
    });
  });

  describe('formatTimestamp', () => {
    it('should return ISO string with Z suffix', () => {
      const date = new Date('2026-05-01T12:00:00.000Z');

      const result = helpersService.formatTimestamp(date);

      expect(result).toBe('2026-05-01T12:00:00.000Z');
      expect(result).toContain('Z');
    });

    it('should return valid timestamp format', () => {
      const date = new Date();

      const result = helpersService.formatTimestamp(date);

      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });
  });
});
