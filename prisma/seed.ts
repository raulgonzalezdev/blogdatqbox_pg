import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
const prisma = new PrismaClient();
async function main() {
  const email = "admin@blog.dev";
  const exists = await prisma.user.findUnique({ where: { email } });
  if (!exists) {
    const password = await bcrypt.hash("secret", 10);
    const admin = await prisma.user.create({ data: { email, password, name: "Admin", role: "admin" } });
    await prisma.post.createMany({
      data: [
        { title: "Hola Bun + Next", slug: "hola-bun-next", content: "Bienvenido al stack monolito con Postgres.", authorId: admin.id },
        { title: "UI tipo OpenAI", slug: "ui-tipo-openai", content: "Hero, tarjetas y dark mode activados.", authorId: admin.id }
      ]
    });
    console.log("Seed OK");
  } else {
    console.log("Seed skip");
  }
}
main().finally(() => prisma.$disconnect());
