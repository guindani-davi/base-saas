import { User } from "../models/user.model";

export interface CreateBody {
  email: User["email"];
  password: User["hashedPassword"];
  name: User["name"];
  surname: User["surname"];
}
