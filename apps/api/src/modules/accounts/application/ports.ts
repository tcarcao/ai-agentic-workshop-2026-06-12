export interface AccountRecord {
  id: string;
  email: string;
  passwordHash: string;
  confirmed: boolean;
  confirmationCode: string;
  createdAt: Date;
}

export interface UserRepository {
  findByEmail(email: string): Promise<AccountRecord | null>;
  findById(id: string): Promise<AccountRecord | null>;
  create(rec: {
    email: string;
    passwordHash: string;
    confirmationCode: string;
  }): Promise<AccountRecord>;
  markConfirmed(id: string): Promise<void>;
}

export interface PasswordHasher {
  hash(plain: string): Promise<string>;
  verify(plain: string, stored: string): Promise<boolean>;
}

export interface TokenService {
  sign(userId: string): Promise<string>;
  verify(token: string): Promise<string | null>; // returns userId or null
}
