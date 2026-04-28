import { Inject, Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as crypto from 'crypto';
import { LoginBodyDTO } from 'src/auth/dtos/login.dto';
import { RefreshBodyDTO } from 'src/auth/dtos/refresh.dto';
import { TokensResponseDTO } from 'src/auth/dtos/tokens.dto';
import { InvalidCredentialsException } from 'src/auth/exceptions/invalid-credentials.exception';
import { JwtPayload } from 'src/auth/models/jwt.model';
import { EntityNotFoundException } from 'src/common/exceptions/entity-not-found.exception';
import { IUsersService } from 'src/users/services/i.users.service';
import { IAuthService } from '../i.auth.service';

@Injectable()
export class AuthService extends IAuthService {
  private readonly REFRESH_TOKEN_EXPIRY_MS = 7 * 24 * 3600_000;
  private readonly logger: Logger;

  public constructor(
    @Inject(IUsersService) userService: IUsersService,
    @Inject(JwtService) jwtService: JwtService,
  ) {
    super(userService, jwtService);
    this.logger = new Logger(AuthService.name);
  }

  public async login(dto: LoginBodyDTO): Promise<TokensResponseDTO> {
    const payload = await this.validateUser(dto);

    const accessToken = await this.jwtService.signAsync(payload);
    const refreshToken = await this.generateRefreshToken(payload);

    return { accessToken, refreshToken };
  }

  public refresh(dto: RefreshBodyDTO): Promise<TokensResponseDTO> {
    throw new Error('Method not implemented.');
  }

  public logout(dto: RefreshBodyDTO): Promise<void> {
    throw new Error('Method not implemented.');
  }

  private async validateUser(dto: LoginBodyDTO): Promise<JwtPayload> {
    try {
      const returnedUser = await this.userService.getByEmail({
        email: dto.email,
      });

      const passwordsMatch = await this.userService.comparePasswords(
        dto.password,
        returnedUser.hashedPassword,
      );

      if (!passwordsMatch) {
        throw new InvalidCredentialsException();
      }

      return {
        sub: returnedUser.id,
      };
    } catch (error) {
      if (error instanceof EntityNotFoundException) {
        throw new InvalidCredentialsException();
      }

      throw error;
    }
  }

  private async generateRefreshToken(payload: JwtPayload): Promise<string> {
    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto
      .createHash('sha256')
      .update(rawToken)
      .digest('hex');

    await this.authRepository.storeRefreshToken({});

    return rawToken;
  }
}
