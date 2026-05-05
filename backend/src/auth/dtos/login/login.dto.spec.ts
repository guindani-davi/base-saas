import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { describe, expect, it } from 'vitest';
import { LoginBodyDTO } from './login.dto';

const createBodyDTO = (data: Partial<LoginBodyDTO>): LoginBodyDTO => {
  return plainToInstance(LoginBodyDTO, data);
};

describe('LoginBodyDTO', () => {
  describe('valid input', () => {
    it('should pass validation with valid email and password', async () => {
      const dto = createBodyDTO({
        email: 'test@example.com',
        password: 'password123',
      });

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });
  });

  describe('email validation', () => {
    it('should fail when email is empty', async () => {
      const dto = createBodyDTO({
        email: '',
        password: 'password123',
      });

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('email');
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('should fail when email is not provided', async () => {
      const dto = createBodyDTO({
        password: 'password123',
      });

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.property === 'email')).toBe(true);
    });

    it('should fail when email format is invalid', async () => {
      const dto = createBodyDTO({
        email: 'invalid-email',
        password: 'password123',
      });

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('email');
      expect(errors[0].constraints).toHaveProperty('isEmail');
    });
  });

  describe('password validation', () => {
    it('should fail when password is empty', async () => {
      const dto = createBodyDTO({
        email: 'test@example.com',
        password: '',
      });

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('password');
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('should fail when password is not provided', async () => {
      const dto = createBodyDTO({
        email: 'test@example.com',
      });

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.property === 'password')).toBe(true);
    });

    it('should fail when password is not a string', async () => {
      const dto = createBodyDTO({
        email: 'test@example.com',
        password: 12345 as unknown as string,
      });

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('password');
      expect(errors[0].constraints).toHaveProperty('isString');
    });
  });
});
