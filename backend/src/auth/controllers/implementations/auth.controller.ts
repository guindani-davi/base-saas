import { TokensResponse } from '@base-saas/shared';
import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
} from '@nestjs/common';
import { Public } from '../../../auth/decorators/public/public.decorator';
import { IAuthService } from '../../../auth/services/i.auth.service';
import { LoginBodyDTO } from '../../dtos/login/login.dto';
import { RunPasswordResetBodyDTO } from '../../dtos/password-reset/run/run.dto';
import { StartPasswordResetBodyDTO } from '../../dtos/password-reset/start/start.dto';
import { RefreshBodyDTO } from '../../dtos/refresh/refresh.dto';
import { IAuthController } from '../i.auth.controller';

@Public()
@Controller('auth')
export class AuthController extends IAuthController {
  public constructor(@Inject(IAuthService) authService: IAuthService) {
    super(authService);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  public async login(@Body() body: LoginBodyDTO): Promise<TokensResponse> {
    return await this.authService.login(body);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  public async refresh(@Body() body: RefreshBodyDTO): Promise<TokensResponse> {
    return await this.authService.refresh(body);
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  public async logout(@Body() body: RefreshBodyDTO): Promise<void> {
    return await this.authService.logout(body);
  }

  @Post('start-password-reset')
  @HttpCode(HttpStatus.NO_CONTENT)
  public async startPasswordReset(
    @Body() body: StartPasswordResetBodyDTO,
  ): Promise<void> {
    await this.authService.startPasswordReset(body);
  }

  @Post('run-password-reset')
  @HttpCode(HttpStatus.NO_CONTENT)
  public async runPasswordReset(
    @Body() body: RunPasswordResetBodyDTO,
  ): Promise<void> {
    await this.authService.runPasswordReset(body);
  }
}
