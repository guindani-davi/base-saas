import { User } from "../../users";

export interface LoginBody {
  email: User["email"];
  password: User["hashedPassword"];
}
