import { User } from "../../users";
import { PasswordResetToken } from "../models/tokens/password-reset.model";

export interface RunPasswordResetBody {
  token: PasswordResetToken["hashedToken"];
  newPassword: User["hashedPassword"];
}
