import { PrismaClient, Role } from "@prisma/client";
import argon2 from "argon2";

const prisma = new PrismaClient();

async function main() {
  // 1) Services
  const services = ["General", "Pediatrics", "Dental", "Gynecology"];
  for (const name of services) {
    await prisma.service.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  // 2) Rooms
  const rooms = ["Room 1", "Room 2", "Room 3"];
  for (const name of rooms) {
    await prisma.room.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }
await prisma.user.upsert({
  where: { id: "reception-1" },
  update: {},
  create: {
    id: "reception-1",
    fullName: "Reception User",
    role: Role.RECEPTION,
    pinHash: await argon2.hash("1111"),
    isActive: true,
  },
});

await prisma.user.upsert({
  where: { id: "triage-1" },
  update: {},
  create: {
    id: "triage-1",
    fullName: "Triage Nurse",
    role: Role.TRIAGE,
    pinHash: await argon2.hash("2222"),
    isActive: true,
  },
});

await prisma.user.upsert({
  where: { id: "doctor-1" },
  update: {},
  create: {
    id: "doctor-1",
    fullName: "Doctor John",
    role: Role.DOCTOR,
    pinHash: await argon2.hash("3333"),
    isActive: true,
  },
});


  // 3) Admin (PIN: 1234) -> store argon2 hash
  const pinHash = await argon2.hash("1234");

  console.log("Seed complete. Admin PIN=1234");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
