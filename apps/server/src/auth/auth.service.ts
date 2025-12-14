import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import argon2 from "argon2";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class AuthService {
  constructor(
    private readonly jwt: JwtService,
    private readonly prisma: PrismaService
  ) {}

  private sign(user: { id: string; role: string; fullName: string }) {
    const payload = { sub: user.id, role: user.role, name: user.fullName };
    const accessToken = this.jwt.sign(payload);
    return { accessToken, user: payload };
  }

  async loginWithPin(userId: string, pin: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.isActive) throw new UnauthorizedException("Invalid user");

    // PIN is stored as Argon2 hash in user.pinHash
    const ok = await argon2.verify(user.pinHash, pin);
    if (!ok) throw new UnauthorizedException("Invalid PIN");

    return this.sign({ id: user.id, role: user.role, fullName: user.fullName });
  }

  async loginWithPassword(userId: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.isActive) throw new UnauthorizedException("Invalid user");
    if (!user.passwordHash) throw new UnauthorizedException("Password not set");

    const ok = await argon2.verify(user.passwordHash, password);
    if (!ok) throw new UnauthorizedException("Invalid password");

    return this.sign({ id: user.id, role: user.role, fullName: user.fullName });
  }
}
