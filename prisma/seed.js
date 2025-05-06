import { PrismaClient } from '@prisma/client';
import { InfluenceurSeeder } from './seeders/InfluenceurSeeder.js';
import { UserSeeder } from './seeders/UserSeeder.js';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Démarrage du seeding...');

  await InfluenceurSeeder();
  await UserSeeder();
//   await seedVotes();

  console.log('✅ Seeding terminé !');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
