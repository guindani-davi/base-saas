import { User } from "../../../users";

export class PasswordResetToken {
  public readonly id: string;
  public readonly userId: User["id"];
  public readonly hashedToken: string;
  public readonly expiresAt: Date;
  public readonly usedAt: Date | null;
  public readonly createdAt: Date;

  public constructor(
    id: string,
    userId: User["id"],
    hashedToken: string,
    expiresAt: Date,
    usedAt: Date | null,
    createdAt: Date,
  ) {
    this.id = id;
    this.userId = userId;
    this.hashedToken = hashedToken;
    this.expiresAt = expiresAt;
    this.usedAt = usedAt;
    this.createdAt = createdAt;
  }
}
