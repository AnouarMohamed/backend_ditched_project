import { Body, Controller, Get, Patch, Post, Param, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { VisitsService } from "./visits.service";
import { Priority, VisitStatus } from "@prisma/client";

type CreateVisitDto = {
  patientId: string;
  serviceId: string; // required (matches VisitsService)
};

type UpdateVisitStatusDto = {
  status: VisitStatus;
  roomId?: string | null;
  priority?: Priority;
};

@UseGuards(JwtAuthGuard)
@Controller("visits")
export class VisitsController {
  constructor(private readonly visits: VisitsService) {}

  @Post()
  create(@Body() body: CreateVisitDto) {
    return this.visits.createVisit({
      patientId: body.patientId,
      serviceId: body.serviceId,
    });
  }

  @Get("queue")
  queue() {
    return this.visits.queue();
  }

  @Get("today")
  today() {
    return this.visits.completedToday();
  }

  @Patch(":id/status")
  updateStatus(@Param("id") id: string, @Body() body: UpdateVisitStatusDto) {
    return this.visits.updateStatus({
      id,
      status: body.status,
      roomId: body.roomId,
      priority: body.priority,
    });
  }
}
