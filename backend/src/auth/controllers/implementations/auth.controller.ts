import { Controller } from '@nestjs/common';
import { TokensResponseDTO } from 'src/auth/dtos/tokens.dto';
import { LoginBodyDTO } from '../../dtos/login.dto';
import { RefreshBodyDTO } from '../../dtos/refresh.dto';
import { IAuthController } from '../i.auth.controller';

@Controller('auth')
export class AuthController extends IAuthController {
  public login(body: LoginBodyDTO): Promise<TokensResponseDTO> {
    throw new Error('Method not implemented.');
  }
  public refresh(body: RefreshBodyDTO): Promise<TokensResponseDTO> {
    throw new Error('Method not implemented.');
  }
  public logout(body: RefreshBodyDTO): Promise<void> {
    throw new Error('Method not implemented.');
  }
}
