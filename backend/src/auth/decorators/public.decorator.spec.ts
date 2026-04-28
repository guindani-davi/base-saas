import { describe, expect, it } from 'vitest';
import { IS_PUBLIC_KEY } from './public.decorator';

describe('Public Decorator', () => {
  it('should export the correct metadata key', () => {
    expect(IS_PUBLIC_KEY).toBe('isPublic');
  });
});
