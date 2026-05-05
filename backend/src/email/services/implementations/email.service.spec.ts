import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { EmailService } from './email.service';

const mockResendSend = vi.fn();

vi.mock('resend', () => ({
  Resend: class {
    emails = {
      send: mockResendSend,
    };
  },
}));

describe('EmailService', () => {
  let emailService: EmailService;
  let configService: ConfigService;

  const mockFromAddress = 'noreply@example.com';
  const mockFrontendUrl = 'https://app.example.com';
  const mockResendApiKey = 'test-api-key';

  beforeEach(async () => {
    vi.clearAllMocks();
    mockResendSend.mockResolvedValue({ id: 'email-id' });

    const moduleRef = await Test.createTestingModule({
      providers: [EmailService],
    })
      .useMocker((token) => {
        if (token === ConfigService) {
          return {
            getOrThrow: vi.fn().mockImplementation((key: string) => {
              switch (key) {
                case 'EMAIL_FROM':
                  return mockFromAddress;
                case 'FRONTEND_URL':
                  return mockFrontendUrl;
                case 'RESEND_API_KEY':
                  return mockResendApiKey;
                default:
                  throw new Error(`Unknown config key: ${key}`);
              }
            }),
          };
        }
      })
      .compile();

    emailService = moduleRef.get(EmailService);
    configService = moduleRef.get(ConfigService);
  });

  describe('constructor', () => {
    it('should initialize with correct configuration values', () => {
      expect(configService.getOrThrow).toHaveBeenCalledWith('EMAIL_FROM');
      expect(configService.getOrThrow).toHaveBeenCalledWith('FRONTEND_URL');
      expect(configService.getOrThrow).toHaveBeenCalledWith('RESEND_API_KEY');
    });
  });

  describe('sendPasswordResetEmail', () => {
    const mockTo = 'user@example.com';
    const mockResetToken = 'reset-token-123';

    it('should call resend.emails.send with correct parameters', async () => {
      await emailService.sendPasswordResetEmail(mockTo, mockResetToken);

      expect(mockResendSend).toHaveBeenCalledTimes(1);
      expect(mockResendSend).toHaveBeenCalledWith({
        from: mockFromAddress,
        to: mockTo,
        subject: 'Redefinição de senha',
        html: expect.stringContaining('href='),
      });
    });

    it('should build reset link with correct format', async () => {
      await emailService.sendPasswordResetEmail(mockTo, mockResetToken);

      const expectedResetLink = `${mockFrontendUrl}/reset-password?token=${mockResetToken}`;
      expect(mockResendSend).toHaveBeenCalledWith(
        expect.objectContaining({
          html: expect.stringContaining(expectedResetLink),
        }),
      );
    });

    it('should include the token in the reset link', async () => {
      await emailService.sendPasswordResetEmail(mockTo, mockResetToken);

      expect(mockResendSend).toHaveBeenCalledWith(
        expect.objectContaining({
          html: expect.stringContaining(mockResetToken),
        }),
      );
    });

    it('should use the configured from address', async () => {
      await emailService.sendPasswordResetEmail(mockTo, mockResetToken);

      expect(mockResendSend).toHaveBeenCalledWith(
        expect.objectContaining({
          from: mockFromAddress,
        }),
      );
    });

    it('should throw when resend.emails.send fails', async () => {
      const sendError = new Error('Resend API error');
      mockResendSend.mockRejectedValue(sendError);

      await expect(
        emailService.sendPasswordResetEmail(mockTo, mockResetToken),
      ).rejects.toThrow(sendError);
    });

    it('should handle special characters in email address', async () => {
      const specialEmail = 'user+tag@example.com';

      await emailService.sendPasswordResetEmail(specialEmail, mockResetToken);

      expect(mockResendSend).toHaveBeenCalledWith(
        expect.objectContaining({
          to: specialEmail,
        }),
      );
    });

    it('should handle special characters in reset token', async () => {
      const specialToken = 'token-with-special_chars.123';

      await emailService.sendPasswordResetEmail(mockTo, specialToken);

      expect(mockResendSend).toHaveBeenCalledWith(
        expect.objectContaining({
          html: expect.stringContaining(specialToken),
        }),
      );
    });
  });
});
