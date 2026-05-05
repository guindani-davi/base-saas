import { User } from "../../../users";

export class RefreshToken {
  public readonly id: string;
  public readonly userId: User["id"];
  public readonly hashedToken: string;
  public readonly expiresAt: Date;
  public readonly revokedAt: Date | null;
  public readonly createdAt: Date;

  public constructor(
    id: string,
    userId: User["id"],
    hashedToken: string,
    expiresAt: Date,
    revokedAt: Date | null,
    createdAt: Date,
  ) {
    this.id = id;
    this.userId = userId;
    this.hashedToken = hashedToken;
    this.expiresAt = expiresAt;
    this.revokedAt = revokedAt;
    this.createdAt = createdAt;
  }
}
