import { User } from "./user.model";

export class SafeUser implements Omit<User, "hashedPassword"> {
  public readonly id: User["id"];
  public readonly email: User["email"];
  public readonly name: User["name"];
  public readonly surname: User["surname"];
  public readonly createdAt: User["createdAt"];
  public readonly updatedAt: User["updatedAt"];

  public constructor(user: User) {
    this.id = user.id;
    this.email = user.email;
    this.name = user.name;
    this.surname = user.surname;
    this.createdAt = user.createdAt;
    this.updatedAt = user.updatedAt;
  }
}
