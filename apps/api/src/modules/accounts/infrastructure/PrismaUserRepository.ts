import type { PrismaClient } from "@prisma/client";
import type { AccountRecord, UserRepository } from "../application/ports.js";

export class PrismaUserRepository implements UserRepository {
  constructor(private readonly db: PrismaClient) {}

  findByEmail(email: string): Promise<AccountRecord | null> {
    return this.db.user.findUnique({ where: { email } });
  }

  findById(id: string): Promise<AccountRecord | null> {
    return this.db.user.findUnique({ where: { id } });
  }

  create(rec: {
    email: string;
    passwordHash: string;
    confirmationCode: string;
  }): Promise<AccountRecord> {
    return this.db.user.create({
      data: {
        email: rec.email,
        passwordHash: rec.passwordHash,
        confirmationCode: rec.confirmationCode,
      },
    });
  }

  async markConfirmed(id: string): Promise<void> {
    await this.db.user.update({ where: { id }, data: { confirmed: true } });
  }
}
