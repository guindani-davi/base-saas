import { IsEmail, IsNotEmpty, IsUUID } from 'class-validator';

export class GetUserByIdParamsDTO {
  @IsNotEmpty()
  @IsUUID()
  public id: string;
}

export class GetUserByEmailParamsDTO {
  @IsNotEmpty()
  @IsEmail()
  public email: string;
}
