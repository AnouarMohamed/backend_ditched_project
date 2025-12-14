import { Body, Controller, Get, Post, Req, UseGuards, UsePipes } from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import { AuthService } from "./auth.service";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import { LoginPasswordDto, LoginPinDto } from "./dto/auth.dto";
import { ZodValidationPipe } from "../common/zod-validation.pipe";

type JwtUser = {
  sub: string;
  role: string;
  name: string;
  iat?: number;
  exp?: number;
};

@Controller("auth")
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  // ✅ This is the correct Throttle signature for your setup (1 argument)
  @Throttle({ default: { ttl: 60, limit: 5 } })
  @UsePipes(new ZodValidationPipe(LoginPinDto))
  @Post("login/pin")
  loginWithPin(@Body() body: LoginPinDto) {
    return this.auth.loginWithPin(body.userId, body.pin);
  }

  @Throttle({ default: { ttl: 60, limit: 5 } })
  @UsePipes(new ZodValidationPipe(LoginPasswordDto))
  @Post("login/password")
  loginWithPassword(@Body() body: LoginPasswordDto) {
    return this.auth.loginWithPassword(body.userId, body.password);
  }

  @UseGuards(JwtAuthGuard)
  @Get("me")
  me(@Req() req: { user: JwtUser }) {
    return req.user;
  }
}
