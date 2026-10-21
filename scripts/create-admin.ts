import { PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";
import { z } from "zod";

const setupSchema = z.object({
  email: z.email().transform((value) => value.trim().toLowerCase()),
  name: z.string().trim().min(2).max(120),
  password: z.string().min(16).max(128),
});

async function main() {
  const parsed = setupSchema.safeParse({
    email: process.env.ADMIN_SETUP_EMAIL,
    name: process.env.ADMIN_SETUP_NAME,
    password: process.env.ADMIN_SETUP_PASSWORD,
  });
  if (!parsed.success) {
    throw new Error("Set a valid admin email, name, and a unique password of at least 16 characters.");
  }

  const prisma = new PrismaClient();
  try {
    const passwordHash = await bcrypt.hash(parsed.data.password, 12);
    await prisma.user.upsert({
      where: { email: parsed.data.email },
      update: { name: parsed.data.name, passwordHash, role: UserRole.ADMIN },
      create: { email: parsed.data.email, name: parsed.data.name, passwordHash, role: UserRole.ADMIN },
      select: { id: true },
    });
    console.info(`Administrator account configured for ${parsed.data.email}.`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error: unknown) => {
  console.error("Administrator setup failed.", error instanceof Error ? error.message : "Unknown error");
  process.exitCode = 1;
});
