import { Body, Controller, Get, Post, Query, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { PatientsService } from "./patients.service";

@UseGuards(JwtAuthGuard)
@Controller("patients")
export class PatientsController {
  constructor(private readonly patients: PatientsService) {}

  @Post()
  create(@Body() body: { name: string }) {
    return this.patients.createPatient({ name: body.name });
  }

  @Get()
  search(@Query("search") search?: string) {
    return this.patients.searchPatients(search);
  }
}
