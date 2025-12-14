import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class PatientsService {
  constructor(private readonly prisma: PrismaService) {}

  async createPatient(input: { name: string }) {
    if (!input.name?.trim()) throw new BadRequestException("name is required");

    return this.prisma.patient.create({
      data: {
        fullName: input.name.trim(),
      },
    });
  }

  async searchPatients(search?: string) {
    const q = search?.trim();

    if (!q) {
      return this.prisma.patient.findMany({
        orderBy: { createdAt: "desc" },
        take: 20,
      });
    }

    return this.prisma.patient.findMany({
      where: {
        OR: [
          { fullName: { contains: q, mode: "insensitive" } },
          { phone: { contains: q } },
          { email: { contains: q, mode: "insensitive" } },
          { nationalId: { contains: q } },
        ],
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
  }
}
