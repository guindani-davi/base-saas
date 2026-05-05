import { RefreshToken } from "../models/tokens/refresh.model";

export interface RefreshBody {
  refreshToken: RefreshToken["hashedToken"];
}
