import { User } from "../../users/models/user.model";

export interface JwtPayload {
  sub: User["id"];
}
