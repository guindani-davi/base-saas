import { User } from "../..";

export interface GetByIdParams {
  id: User["id"];
}

export interface GetByEmailParams {
  email: User["email"];
}
