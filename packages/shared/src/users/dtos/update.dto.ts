import { User } from "../models/user.model";

export interface UpdateParams {
  id: User["id"];
}

export interface UpdateBody {
  name?: User["name"];
  surname?: User["surname"];
}
