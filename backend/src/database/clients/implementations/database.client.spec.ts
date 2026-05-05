import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { IDatabaseClient } from '../i.database.client';
import { DatabaseClient } from './database.client';

describe('DatabaseClient', () => {
  const mockSupabaseUrl = 'https://test.supabase.co';
  const mockSupabaseKey = 'test-secret-key';

  let databaseClient: DatabaseClient;
  let configService: ConfigService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [DatabaseClient],
    })
      .useMocker((token) => {
        if (token === ConfigService) {
          return {
            getOrThrow: vi.fn().mockImplementation((key: string) => {
              if (key === 'SUPABASE_URL') return mockSupabaseUrl;
              if (key === 'SUPABASE_SECRET_KEY') return mockSupabaseKey;
              throw new Error(`Unknown config key: ${key}`);
            }),
          };
        }
      })
      .compile();

    databaseClient = moduleRef.get(DatabaseClient);
    configService = moduleRef.get(ConfigService);
  });

  it('should be defined', () => {
    expect(databaseClient).toBeDefined();
  });

  it('should be an instance of IDatabaseClient', () => {
    expect(databaseClient).toBeInstanceOf(IDatabaseClient);
  });

  it('should call configService.getOrThrow for SUPABASE_URL', () => {
    expect(configService.getOrThrow).toHaveBeenCalledWith('SUPABASE_URL');
  });

  it('should call configService.getOrThrow for SUPABASE_SECRET_KEY', () => {
    expect(configService.getOrThrow).toHaveBeenCalledWith(
      'SUPABASE_SECRET_KEY',
    );
  });
});
