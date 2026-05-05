import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { describe, expect, it } from 'vitest';
import { RefreshBodyDTO } from './refresh.dto';

const createBodyDTO = (data: Partial<RefreshBodyDTO>): RefreshBodyDTO => {
  return plainToInstance(RefreshBodyDTO, data);
};

describe('RefreshBodyDTO', () => {
  describe('valid input', () => {
    it('should pass validation with valid refresh token', async () => {
      const dto = createBodyDTO({
        refreshToken: 'valid-refresh-token-123',
      });

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });
  });

  describe('refreshToken validation', () => {
    it('should fail when refreshToken is empty', async () => {
      const dto = createBodyDTO({
        refreshToken: '',
      });

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('refreshToken');
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('should fail when refreshToken is not provided', async () => {
      const dto = createBodyDTO({});

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('refreshToken');
    });

    it('should fail when refreshToken is not a string', async () => {
      const dto = createBodyDTO({
        refreshToken: 12345 as unknown as string,
      });

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('refreshToken');
      expect(errors[0].constraints).toHaveProperty('isString');
    });
  });
});
