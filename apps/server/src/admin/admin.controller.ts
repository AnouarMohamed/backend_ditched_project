import { Controller, Get, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { Roles } from "../auth/decorators/roles.decorator";

@Controller("admin")
@UseGuards(JwtAuthGuard)
export class AdminController {
  @Get("health")
  @Roles("ADMIN")
  health() {
    return { ok: true, ts: Date.now() };
  }
}


