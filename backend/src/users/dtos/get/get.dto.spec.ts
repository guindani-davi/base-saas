import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { describe, expect, it } from 'vitest';
import { GetByEmailParamsDTO, GetByIdParamsDTO } from './get.dto';

const createIdParamsDTO = (
  data: Partial<GetByIdParamsDTO>,
): GetByIdParamsDTO => {
  return plainToInstance(GetByIdParamsDTO, data);
};

const createEmailParamsDTO = (
  data: Partial<GetByEmailParamsDTO>,
): GetByEmailParamsDTO => {
  return plainToInstance(GetByEmailParamsDTO, data);
};

describe('GetByIdParamsDTO', () => {
  describe('valid input', () => {
    it('should pass validation with valid UUID', async () => {
      const dto = createIdParamsDTO({
        id: '550e8400-e29b-41d4-a716-446655440000',
      });

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });
  });

  describe('id validation', () => {
    it('should fail when id is empty', async () => {
      const dto = createIdParamsDTO({
        id: '',
      });

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('id');
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('should fail when id is not provided', async () => {
      const dto = createIdParamsDTO({});

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('id');
    });

    it('should fail when id is not a valid UUID', async () => {
      const dto = createIdParamsDTO({
        id: 'not-a-uuid',
      });

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('id');
      expect(errors[0].constraints).toHaveProperty('isUuid');
    });
  });
});

describe('GetByEmailParamsDTO', () => {
  describe('valid input', () => {
    it('should pass validation with valid email', async () => {
      const dto = createEmailParamsDTO({
        email: 'test@example.com',
      });

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });
  });

  describe('email validation', () => {
    it('should fail when email is empty', async () => {
      const dto = createEmailParamsDTO({
        email: '',
      });

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('email');
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('should fail when email is not provided', async () => {
      const dto = createEmailParamsDTO({});

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('email');
    });

    it('should fail when email format is invalid', async () => {
      const dto = createEmailParamsDTO({
        email: 'invalid-email',
      });

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('email');
      expect(errors[0].constraints).toHaveProperty('isEmail');
    });
  });
});
