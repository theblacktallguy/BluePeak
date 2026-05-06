import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, Role } from "@prisma/client";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  const passwordHash = await bcrypt.hash("Admin12345!", 10);

  const admin = await prisma.user.upsert({
    where: {
      email: "admin@bluepeak.test",
    },
    update: {
      role: Role.ADMIN,
      isActive: true,
      isFrozen: false,
      passwordHash,
    },
    create: {
      fullName: "System Administrator",
      email: "admin@bluepeak.test",
      passwordHash,
      role: Role.ADMIN,
      accessCode: "000000",
      isActive: true,
      isFrozen: false,
    },
  });

  console.log("Admin user ready:");
  console.log("Email:", admin.email);
  console.log("Password: Admin12345!");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });