import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { describe, expect, it } from 'vitest';
import { CreateBodyDTO } from './create.dto';

const createBodyDTO = (data: Partial<CreateBodyDTO>): CreateBodyDTO => {
  return plainToInstance(CreateBodyDTO, data);
};

describe('CreateBodyDTO', () => {
  describe('valid input', () => {
    it('should pass validation with all valid fields', async () => {
      const dto = createBodyDTO({
        email: 'test@example.com',
        password: 'password123',
        name: 'John',
        surname: 'Doe',
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
        name: 'John',
        surname: 'Doe',
      });

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('email');
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('should fail when email is not provided', async () => {
      const dto = createBodyDTO({
        password: 'password123',
        name: 'John',
        surname: 'Doe',
      });

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.property === 'email')).toBe(true);
    });

    it('should fail when email format is invalid', async () => {
      const dto = createBodyDTO({
        email: 'invalid-email',
        password: 'password123',
        name: 'John',
        surname: 'Doe',
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
        name: 'John',
        surname: 'Doe',
      });

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.property === 'password')).toBe(true);
    });

    it('should fail when password is not provided', async () => {
      const dto = createBodyDTO({
        email: 'test@example.com',
        name: 'John',
        surname: 'Doe',
      });

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.property === 'password')).toBe(true);
    });

    it('should fail when password is not a string', async () => {
      const dto = createBodyDTO({
        email: 'test@example.com',
        password: 12345 as unknown as string,
        name: 'John',
        surname: 'Doe',
      });

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.property === 'password')).toBe(true);
    });
  });

  describe('name validation', () => {
    it('should fail when name is empty', async () => {
      const dto = createBodyDTO({
        email: 'test@example.com',
        password: 'password123',
        name: '',
        surname: 'Doe',
      });

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.property === 'name')).toBe(true);
    });

    it('should fail when name is not provided', async () => {
      const dto = createBodyDTO({
        email: 'test@example.com',
        password: 'password123',
        surname: 'Doe',
      });

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.property === 'name')).toBe(true);
    });

    it('should fail when name is not a string', async () => {
      const dto = createBodyDTO({
        email: 'test@example.com',
        password: 'password123',
        name: 123 as unknown as string,
        surname: 'Doe',
      });

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.property === 'name')).toBe(true);
    });
  });

  describe('surname validation', () => {
    it('should fail when surname is empty', async () => {
      const dto = createBodyDTO({
        email: 'test@example.com',
        password: 'password123',
        name: 'John',
        surname: '',
      });

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.property === 'surname')).toBe(true);
    });

    it('should fail when surname is not provided', async () => {
      const dto = createBodyDTO({
        email: 'test@example.com',
        password: 'password123',
        name: 'John',
      });

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.property === 'surname')).toBe(true);
    });

    it('should fail when surname is not a string', async () => {
      const dto = createBodyDTO({
        email: 'test@example.com',
        password: 'password123',
        name: 'John',
        surname: 123 as unknown as string,
      });

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.property === 'surname')).toBe(true);
    });
  });
});
