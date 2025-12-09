import 'dotenv/config';
import { prisma } from '@/lib/prisma';

async function main() {
  console.log('🌱 Starting seed...');

  // Clean database
  await prisma.paymentMembership.deleteMany();
  await prisma.paymentRegistration.deleteMany();
  await prisma.paymentGroup.deleteMany();
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
  const season = await prisma.season.create({
    data: {
      startYear: 2024,
      endYear: 2025,
      label: '2024-2025',
      membershipAmount: 50.00,
      isActive: true,
    },
  });
  console.log('✅ Season created:', season.label);

  // Create workshops
  const dancingWorkshop = await prisma.workshop.create({
    data: {
      name: 'Modern Dance',
      description: 'Modern dance classes for all levels',
      isActive: true,
    },
  });

  const theaterWorkshop = await prisma.workshop.create({
    data: {
      name: 'Theater',
      description: 'Theater and improvisation workshop',
      isActive: true,
    },
  });

  const musicWorkshop = await prisma.workshop.create({
    data: {
      name: 'Music',
      description: 'Music and instrument lessons',
      isActive: true,
    },
  });

  console.log('✅ Workshops created');

  // Create workshop prices
  await prisma.workshopPrice.createMany({
    data: [
      { workshopId: dancingWorkshop.id, seasonId: season.id, amount: 150.00 },
      { workshopId: theaterWorkshop.id, seasonId: season.id, amount: 120.00 },
      { workshopId: musicWorkshop.id, seasonId: season.id, amount: 200.00 },
    ],
  });
  console.log('✅ Workshop prices created');

  // Create Dupont family
  const dupontFamily = await prisma.family.create({
    data: {
      name: 'Dupont',
      address: '12 rue des Lilas, 75001 Paris',
      phone: '0601020304',
      email: 'famille.dupont@email.fr',
    },
  });

  // Create Dupont family members
  const sophieDupont = await prisma.member.create({
    data: {
      familyId: dupontFamily.id,
      lastName: 'Dupont',
      firstName: 'Sophie',
      isMinor: false,
      email: 'sophie.dupont@email.fr',
      phone: '0601020304',
    },
  });

  const lucasDupont = await prisma.member.create({
    data: {
      familyId: dupontFamily.id,
      lastName: 'Dupont',
      firstName: 'Lucas',
      isMinor: true,
      guardianLastName: 'Dupont',
      guardianFirstName: 'Sophie',
      guardianPhone: '0601020304',
      guardianEmail: 'sophie.dupont@email.fr',
      guardianRelation: 'mother',
    },
  });

  const emmaDupont = await prisma.member.create({
    data: {
      familyId: dupontFamily.id,
      lastName: 'Dupont',
      firstName: 'Emma',
      isMinor: true,
      guardianLastName: 'Dupont',
      guardianFirstName: 'Sophie',
      guardianPhone: '0601020304',
      guardianEmail: 'sophie.dupont@email.fr',
      guardianRelation: 'mother',
    },
  });

  console.log('✅ Dupont family created (3 members)');

  // Create Martin family
  const martinFamily = await prisma.family.create({
    data: {
      name: 'Martin',
      address: '45 avenue Victor Hugo, 75016 Paris',
      phone: '0607080910',
      email: 'famille.martin@email.fr',
    },
  });

  const pierreMartin = await prisma.member.create({
    data: {
      familyId: martinFamily.id,
      lastName: 'Martin',
      firstName: 'Pierre',
      isMinor: false,
      email: 'pierre.martin@email.fr',
      phone: '0607080910',
    },
  });

  console.log('✅ Martin family created (1 member)');

  // Create memberships for Dupont family
  const membershipSophie = await prisma.membership.create({
    data: {
      memberId: sophieDupont.id,
      seasonId: season.id,
      amount: season.membershipAmount,
      status: 'validated',
    },
  });

  const membershipLucas = await prisma.membership.create({
    data: {
      memberId: lucasDupont.id,
      seasonId: season.id,
      amount: season.membershipAmount,
      status: 'validated',
    },
  });

  const membershipEmma = await prisma.membership.create({
    data: {
      memberId: emmaDupont.id,
      seasonId: season.id,
      amount: season.membershipAmount,
      status: 'validated',
    },
  });

  console.log('✅ Memberships created for Dupont family');

  // Create registrations (workshops only) for Dupont family
  const registrationSophie = await prisma.registration.create({
    data: {
      memberId: sophieDupont.id,
      seasonId: season.id,
      familyOrder: 1,
      status: 'validated',
    },
  });

  const registrationLucas = await prisma.registration.create({
    data: {
      memberId: lucasDupont.id,
      seasonId: season.id,
      familyOrder: 2,
      status: 'validated',
    },
  });

  const registrationEmma = await prisma.registration.create({
    data: {
      memberId: emmaDupont.id,
      seasonId: season.id,
      familyOrder: 3,
      status: 'validated',
    },
  });

  console.log('✅ Registrations created for Dupont family');

  // Sophie enrolls in dancing (full price)
  await prisma.workshopRegistration.create({
    data: {
      registrationId: registrationSophie.id,
      workshopId: dancingWorkshop.id,
      appliedPrice: 150.00,
      discountPercent: 0,
    },
  });

  // Lucas enrolls in theater (10% discount)
  await prisma.workshopRegistration.create({
    data: {
      registrationId: registrationLucas.id,
      workshopId: theaterWorkshop.id,
      appliedPrice: 108.00, // 120 - 10%
      discountPercent: 10,
    },
  });

  // Emma enrolls in music (10% discount)
  await prisma.workshopRegistration.create({
    data: {
      registrationId: registrationEmma.id,
      workshopId: musicWorkshop.id,
      appliedPrice: 180.00, // 200 - 10%
      discountPercent: 10,
    },
  });

  console.log('✅ Workshop registrations created');

  // Create group payment for Dupont family memberships (3 x 50€ = 150€)
  const paymentMemberships = await prisma.paymentGroup.create({
    data: {
      reference: 'CHQ-2024-001',
      totalAmount: 150.00,
      paymentType: 'check',
      paymentDate: new Date('2024-09-15'),
      cashingDate: new Date('2024-10-01'),
      status: 'pending',
      notes: 'Chèque adhésions famille Dupont',
    },
  });

  // Link payment to memberships
  await prisma.paymentMembership.createMany({
    data: [
      {
        paymentGroupId: paymentMemberships.id,
        membershipId: membershipSophie.id,
        allocatedAmount: 50.00,
      },
      {
        paymentGroupId: paymentMemberships.id,
        membershipId: membershipLucas.id,
        allocatedAmount: 50.00,
      },
      {
        paymentGroupId: paymentMemberships.id,
        membershipId: membershipEmma.id,
        allocatedAmount: 50.00,
      },
    ],
  });

  console.log('✅ Payment for memberships created');

  // Create group payment for workshops (150 + 108 + 180 = 438€)
  const paymentWorkshops = await prisma.paymentGroup.create({
    data: {
      reference: 'CHQ-2024-002',
      totalAmount: 438.00,
      paymentType: 'check',
      paymentDate: new Date('2024-09-20'),
      status: 'cashed',
      notes: 'Chèque ateliers famille Dupont',
    },
  });

  // Link payment to workshop registrations
  await prisma.paymentRegistration.createMany({
    data: [
      {
        paymentGroupId: paymentWorkshops.id,
        registrationId: registrationSophie.id,
        allocatedAmount: 150.00,
        amountType: 'workshop',
      },
      {
        paymentGroupId: paymentWorkshops.id,
        registrationId: registrationLucas.id,
        allocatedAmount: 108.00,
        amountType: 'workshop',
      },
      {
        paymentGroupId: paymentWorkshops.id,
        registrationId: registrationEmma.id,
        allocatedAmount: 180.00,
        amountType: 'workshop',
      },
    ],
  });

  console.log('✅ Payment for workshops created');

  // Pierre Martin with membership but no workshops
  const membershipPierre = await prisma.membership.create({
    data: {
      memberId: pierreMartin.id,
      seasonId: season.id,
      amount: season.membershipAmount,
      status: 'pending',
    },
  });

  console.log('✅ Membership created for Pierre Martin (unpaid)');

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