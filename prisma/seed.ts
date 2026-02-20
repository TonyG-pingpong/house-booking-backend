import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.booking.deleteMany({});
  await prisma.listing.deleteMany({});

  const hashedPassword = await bcrypt.hash('host123', 10);

  const host = await prisma.user.upsert({
    where: { email: 'host@example.com' },
    update: {},
    create: {
      email: 'host@example.com',
      password: hashedPassword,
      name: 'Demo Host',
    },
  });

  await prisma.listing.createMany({
    data: [
      {
        title: 'Cozy cabin by the lake',
        description:
          'Peaceful retreat with lake views. Perfect for a weekend away. Kitchen, wifi, and a fire pit.',
        price: 120,
        location: 'Lake District',
        hostId: host.id,
      },
      {
        title: 'City loft near the station',
        description:
          'Bright loft in the centre of town. Walking distance to restaurants and transport.',
        price: 85,
        location: 'Central London',
        hostId: host.id,
      },
    ],
  });

  console.log('Seed done: 1 host (host@example.com / host123), 2 listings.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
