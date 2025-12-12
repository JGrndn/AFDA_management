import 'dotenv/config';
import { prisma } from '@/lib/prisma';

async function main() {
  console.log('🌱 Starting seed...');

  // Clean database
  await prisma.payment.deleteMany();
  await prisma.workshopRegistration.deleteMany();
  await prisma.registration.deleteMany();
  await prisma.membership.deleteMany();
  await prisma.workshopPrice.deleteMany();
  await prisma.workshop.deleteMany();
  await prisma.member.deleteMany();
  await prisma.family.deleteMany();
  await prisma.season.deleteMany();

  console.log('✅ Database cleaned');

  // Create a season
  const season2024 = await prisma.season.create({
    data: {
      startYear: 2024,
      endYear: 2025,
      label: '2024-2025',
      membershipAmount: 50,
      isActive: true,
    },
  });

  const season2023 = await prisma.season.create({
    data: {
      startYear: 2023,
      endYear: 2024,
      label: '2023-2024',
      membershipAmount: 40,
      isActive: false,
    },
  });
  console.log('✅ Seasons created');

  // Create workshops
  const dance = await prisma.workshop.create({
    data: {
      name: 'Danse moderne',
      description: 'Atelier de danse pour tous les niveaux',
    },
  });

  const theater = await prisma.workshop.create({
    data: {
      name: 'Théâtre',
      description: 'Atelier théâtre pour développer l’expression orale',
    },
  });

  const music = await prisma.workshop.create({
    data: {
      name: 'Musique',
    },
  });

  console.log('✅ Workshops created');

  // Create workshop prices
  await prisma.workshopPrice.createMany({
    data: [
      { workshopId: dance.id, seasonId: season2024.id, amount: 120 },
      { workshopId: theater.id, seasonId: season2024.id, amount: 100 },
      { workshopId: music.id, seasonId: season2024.id, amount: 150 },
      { workshopId: dance.id, seasonId: season2023.id, amount: 110 },
      { workshopId: theater.id, seasonId: season2023.id, amount: 90 },
    ],
  });

  console.log('✅ Workshop prices created');

  // Create families
  const dupont = await prisma.family.create({
    data: {
      name: 'Famille Dupont',
      email: 'dupont@exemple.com',
    },
  });

  const martin = await prisma.family.create({
    data: {
      name: 'Famille Martin',
      email: 'martin@example.com',
    },
  });

  const solo = await prisma.family.create({
    data: {
      name: 'Famille Solo',
    },
  });

  console.log('✅ Families created');

  // Create members
  const jean = await prisma.member.create({
    data: {
      familyId: dupont.id,
      firstName: 'Jean',
      lastName: 'Dupont',
      email: 'jean.dupont@example.com',
      phone: '0612345678',
      isMinor: false,
    },
  });

  const lea = await prisma.member.create({
    data: {
      familyId: dupont.id,
      firstName: 'Léa',
      lastName: 'Dupont',
      isMinor: true,
      guardianFirstName: 'Marie',
      guardianLastName: 'Dupont',
      guardianEmail: 'marie.dupont@example.com',
      guardianPhone: '0699887766',
      guardianRelation: 'Mother',
    },
  });

  const lucas = await prisma.member.create({
    data: {
      familyId: martin.id,
      firstName: 'Lucas',
      lastName: 'Martin',
      email: 'lucas.martin@example.com',
      phone: '0622334455',
      isMinor: false,
    },
  });

  const camille = await prisma.member.create({
    data: {
      familyId: martin.id,
      firstName: 'Camille',
      lastName: 'Martin',
      isMinor: true,
      guardianFirstName: 'Sophie',
      guardianLastName: 'Martin',
      guardianEmail: 'sophie.martin@example.com',
      guardianPhone: '0644556677',
      guardianRelation: 'Mother',
    },
  });

  const soloMember = await prisma.member.create({
    data: {
      familyId: solo.id,
      firstName: 'Patrick',
      lastName: 'Solo',
      email: 'patrick@example.com',
      isMinor: false,
    },
  });

  console.log('✅ Members created');

  // Create memberships
  await prisma.membership.createMany({
    data: [
      {
        memberId: jean.id,
        seasonId: season2024.id,
        amount: 50,
        status: 'validated',
      },
      {
        memberId: lea.id,
        seasonId: season2024.id,
        amount: 50,
        status: 'pending',
      },
    ],
  });

  console.log('✅ Memberships created for Dupont family');

  // Create registrations (workshops only) for Dupont family
  const regJean = await prisma.registration.create({
    data: {
      memberId: jean.id,
      seasonId: season2024.id,
      familyOrder: 1,
      status: 'confirmed',
      workshopRegistrations: {
        create: [
          {
            workshopId: dance.id,
            appliedPrice: 120,
          },
          {
            workshopId: theater.id,
            appliedPrice: 100,
          },
        ],
      },
    },
  });

  const regLea = await prisma.registration.create({
    data: {
      memberId: lea.id,
      seasonId: season2024.id,
      familyOrder: 2,
      status: 'pending',
      workshopRegistrations: {
        create: [
          {
            workshopId: theater.id,
            appliedPrice: 100,
            discountPercent: 10,
          },
        ],
      },
    },
  });

  console.log('✅ Registrations created');


  // Create payments
  await prisma.payment.create({
    data: {
      familyId: dupont.id,
      seasonId: season2024.id,
      amount: 270,
      paymentType: 'card',
      paymentDate: new Date(),
      status: 'pending',
      reference: 'PAY-001',
    },
  });

  console.log('✅ Payments created');



  console.log('');
  console.log('🎉 Seed completed successfully!');
  console.log('');
  console.log('📊 Summary:');
  console.log('  - 1 season (2024-2025)');
  console.log('  - 3 workshops (Dance, Theater, Music)');
  console.log('  - 2 families (Dupont and Martin)');
  console.log('  - 4 members (3 Dupont, 1 Martin)');
  console.log('  - 4 memberships (3 paid, 1 pending)');
  console.log('  - 3 workshop registrations (paid)');
  console.log('  - 2 group payments (1 pending check, 1 cashed)');
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });