import { BadRequestException, Injectable } from "@nestjs/common";
import { Prisma, Priority, VisitStatus } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class VisitsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Generates a sequential visitNumber per day: A-001, A-002, ...
   * Uses today's count to keep it simple, plus retry if unique collision happens.
   */
  private async generateDailyVisitNumber(): Promise<string> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const countToday = await this.prisma.visit.count({
      where: { createdAt: { gte: today } },
    });

    return `A-${String(countToday + 1).padStart(3, "0")}`;
  }

  async createVisit(input: { patientId: string; serviceId: string }) {
    if (!input.patientId) throw new BadRequestException("patientId is required");
    if (!input.serviceId) throw new BadRequestException("serviceId is required");

    // Retry a few times in case two visits are created at the same time and hit @unique.
    for (let attempt = 1; attempt <= 3; attempt++) {
      const visitNumber = await this.generateDailyVisitNumber();

      try {
        return await this.prisma.visit.create({
          data: {
            visitNumber,
            patientId: input.patientId,
            serviceId: input.serviceId,
            status: VisitStatus.WAITING_TRIAGE,
            priority: Priority.NORMAL,
          },
          include: { patient: true, service: true, room: true },
        });
      } catch (e) {
        // Unique constraint collision on visitNumber => retry
        if (
          e instanceof Prisma.PrismaClientKnownRequestError &&
          e.code === "P2002" &&
          attempt < 3
        ) {
          continue;
        }
        throw e;
      }
    }

    // Should never reach here
    throw new BadRequestException("Could not create visit. Please retry.");
  }

  async queue() {
    const [waitingTriage, waitingDoctor, inConsultation] = await Promise.all([
      this.prisma.visit.findMany({
        where: { status: VisitStatus.WAITING_TRIAGE },
        include: { patient: true, service: true, room: true },
        orderBy: { createdAt: "asc" },
      }),
      this.prisma.visit.findMany({
        where: { status: VisitStatus.WAITING_DOCTOR },
        include: { patient: true, service: true, room: true },
        orderBy: { createdAt: "asc" },
      }),
      this.prisma.visit.findMany({
        where: { status: VisitStatus.IN_CONSULTATION },
        include: { patient: true, service: true, room: true },
        orderBy: { updatedAt: "desc" },
      }),
    ]);

    return { waitingTriage, waitingDoctor, inConsultation };
  }

  async completedToday() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return this.prisma.visit.findMany({
      where: { status: VisitStatus.COMPLETED, completedAt: { gte: today } },
      include: { patient: true, service: true, room: true },
      orderBy: { completedAt: "desc" },
    });
  }

  async updateStatus(input: { id: string; status: VisitStatus; roomId?: string | null; priority?: Priority }) {
    if (!input.id) throw new BadRequestException("id is required");
    if (!input.status) throw new BadRequestException("status is required");

    const data: Prisma.VisitUpdateInput = {
      status: input.status,
    };

    if (input.roomId !== undefined) {
  data.room =
    input.roomId === null
      ? { disconnect: true }
      : { connect: { id: input.roomId } };
}

    if (input.priority !== undefined) data.priority = input.priority;

    if (input.status === VisitStatus.COMPLETED) {
      data.completedAt = new Date();
      // if completed: clear room assignment
      data.room = { disconnect: true };
    }

    return this.prisma.visit.update({
      where: { id: input.id },
      data,
      include: { patient: true, service: true, room: true },
    });
  }
}
