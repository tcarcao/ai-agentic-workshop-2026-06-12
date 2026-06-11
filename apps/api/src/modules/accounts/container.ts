import { prisma } from "../../shared/prismaClient.js";
import { PrismaUserRepository } from "./infrastructure/PrismaUserRepository.js";
import { ScryptPasswordHasher } from "./infrastructure/ScryptPasswordHasher.js";
import { JwtTokenService } from "./infrastructure/JwtTokenService.js";
import { makeSignup } from "./application/signup.js";
import { makeConfirmEmail } from "./application/confirmEmail.js";
import { makeLogin } from "./application/login.js";
import { makeGetCurrentUser } from "./application/getCurrentUser.js";
import { makeGetConfirmationCode } from "./application/getConfirmationCode.js";

const users = new PrismaUserRepository(prisma);
const hasher = new ScryptPasswordHasher();
const tokens = new JwtTokenService();

export const accounts = {
  signup: makeSignup(users, hasher),
  confirmEmail: makeConfirmEmail(users),
  login: makeLogin(users, hasher, tokens),
  getCurrentUser: makeGetCurrentUser(users),
  getConfirmationCode: makeGetConfirmationCode(users),
  verifyToken: (token: string) => tokens.verify(token),
};
