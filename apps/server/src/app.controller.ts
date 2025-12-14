import { Controller, Get, UseGuards } from "@nestjs/common";
import { AppService } from "./app.service";
import { JwtAuthGuard } from "./auth/guards/jwt-auth.guard";
import { RolesGuard } from "./auth/guards/roles.guard";
import { Roles } from "./auth/decorators/roles.decorator";

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello() {
    return this.appService.getHello();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN")
  @Get("admin/ping")
  adminPing() {
    return { ok: true, role: "ADMIN" };
  }
}
