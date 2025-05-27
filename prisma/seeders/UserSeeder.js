import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // console.log("🚀 Démarrage de UserSeeder...");
  // await UserSeeder();
  // console.log("✅ Seeding de UserSeeder terminé !");
}


export async function UserSeeder() {
  const users = [
    { name: "admin", password: "password123" },
  ]

// On verfifie si l'utilisateur existe déjà dans la base de données avant de l'ajouter 
  for (const user of users) {
    const existing = await prisma.users.findFirst({
      where: {
        name: user.name, // Ici on check sur "name"
      },
    });

    // Si l'utilisateur n'existe pas, on l'ajoute
    if (!existing) {
      await prisma.users.create({
        data: user,
      });
      console.log(`✅ Ajouté : ${user.name}`);
    } else {
      console.log(`⏩ Déjà existant : ${user.name}`);
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
