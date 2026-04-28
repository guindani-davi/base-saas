import { User } from "./user.model";

export class SafeUser implements Omit<User, "hashedPassword"> {
  public readonly id: string;
  public readonly email: string;
  public readonly name: string;
  public readonly surname: string;
  public readonly createdAt: Date;
  public readonly updatedAt: Date | null;

  public constructor(user: User) {
    this.id = user.id;
    this.email = user.email;
    this.name = user.name;
    this.surname = user.surname;
    this.createdAt = user.createdAt;
    this.updatedAt = user.updatedAt;
  }
}
