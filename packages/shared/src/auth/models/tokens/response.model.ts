import { RefreshToken } from "../..";

export class TokensResponse {
  public readonly accessToken: string;
  public readonly refreshToken: RefreshToken["hashedToken"];

  public constructor(
    accessToken: string,
    refreshToken: RefreshToken["hashedToken"],
  ) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
  }
}
