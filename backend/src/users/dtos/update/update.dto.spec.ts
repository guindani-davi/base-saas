import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { describe, expect, it } from 'vitest';
import { UpdateBodyDTO, UpdateParamsDTO } from './update.dto';

const createParamsDTO = (data: Partial<UpdateParamsDTO>): UpdateParamsDTO => {
  return plainToInstance(UpdateParamsDTO, data);
};

const createBodyDTO = (data: Partial<UpdateBodyDTO>): UpdateBodyDTO => {
  return plainToInstance(UpdateBodyDTO, data);
};

describe('UpdateParamsDTO', () => {
  describe('valid input', () => {
    it('should pass validation with valid id', async () => {
      const dto = createParamsDTO({
        id: 'user-123',
      });

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });
  });

  describe('id validation', () => {
    it('should fail when id is empty', async () => {
      const dto = createParamsDTO({
        id: '',
      });

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('id');
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('should fail when id is not provided', async () => {
      const dto = createParamsDTO({});

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('id');
    });

    it('should fail when id is not a string', async () => {
      const dto = createParamsDTO({
        id: 123 as unknown as string,
      });

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('id');
      expect(errors[0].constraints).toHaveProperty('isString');
    });
  });
});

describe('UpdateBodyDTO', () => {
  describe('valid input', () => {
    it('should pass validation with all fields', async () => {
      const dto = createBodyDTO({
        name: 'John',
        surname: 'Doe',
      });

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('should pass validation with only name', async () => {
      const dto = createBodyDTO({
        name: 'John',
      });

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('should pass validation with only surname', async () => {
      const dto = createBodyDTO({
        surname: 'Doe',
      });

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('should pass validation with no fields (all optional)', async () => {
      const dto = createBodyDTO({});

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });
  });

  describe('name validation', () => {
    it('should fail when name is empty string', async () => {
      const dto = createBodyDTO({
        name: '',
      });

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('name');
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('should fail when name is not a string', async () => {
      const dto = createBodyDTO({
        name: 123 as unknown as string,
      });

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('name');
      expect(errors[0].constraints).toHaveProperty('isString');
    });
  });

  describe('surname validation', () => {
    it('should fail when surname is empty string', async () => {
      const dto = createBodyDTO({
        surname: '',
      });

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('surname');
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('should fail when surname is not a string', async () => {
      const dto = createBodyDTO({
        surname: 123 as unknown as string,
      });

      const errors = await validate(dto);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('surname');
      expect(errors[0].constraints).toHaveProperty('isString');
    });
  });
});
