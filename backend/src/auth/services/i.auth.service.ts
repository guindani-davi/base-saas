import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { IUsersService } from 'src/users/services/i.users.service';
import { LoginBodyDTO } from '../dtos/login.dto';
import { RefreshBodyDTO } from '../dtos/refresh.dto';
import { TokensResponseDTO } from '../dtos/tokens.dto';

@Injectable()
export abstract class IAuthService {
  protected readonly userService: IUsersService;
  protected readonly jwtService: JwtService;

  public constructor(userService: IUsersService, jwtService: JwtService) {
    this.userService = userService;
    this.jwtService = jwtService;
  }

  public abstract login(dto: LoginBodyDTO): Promise<TokensResponseDTO>;
  public abstract refresh(dto: RefreshBodyDTO): Promise<TokensResponseDTO>;
  public abstract logout(dto: RefreshBodyDTO): Promise<void>;
}
