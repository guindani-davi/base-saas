import { User } from "../../users";

export interface StartPasswordResetBody {
  email: User["email"];
}
