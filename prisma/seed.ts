import 'dotenv/config';
import { PrismaClient } from '@/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Starting seed...');

  // ==================== CLEAN DATABASE ====================
  console.log('🧹 Cleaning database...');
  await prisma.payment.deleteMany();
  await prisma.workshopRegistration.deleteMany();
  await prisma.registration.deleteMany();
  await prisma.membership.deleteMany();
  await prisma.workshopPrice.deleteMany();
  await prisma.workshop.deleteMany();
  await prisma.member.deleteMany();
  await prisma.family.deleteMany();
  await prisma.season.deleteMany();
  await prisma.show.deleteMany();
  await prisma.showClient.deleteMany();
  console.log('✅ Database cleaned');

  // ==================== CREATE SEASONS ====================
  console.log('📅 Creating seasons...');
  
  const season2023 = await prisma.season.create({
    data: {
      startYear: 2023,
      endYear: 2024,
      label: '2023-2024',
      membershipAmount: 45,
      isActive: false,
      totalDonations: 150,
    },
  });

  const season2024 = await prisma.season.create({
    data: {
      startYear: 2024,
      endYear: 2025,
      label: '2024-2025',
      membershipAmount: 50,
      isActive: true,
      totalDonations: 0,
    },
  });

  const season2025 = await prisma.season.create({
    data: {
      startYear: 2025,
      endYear: 2026,
      label: '2025-2026',
      membershipAmount: 55,
      isActive: false,
      totalDonations: 0,
    },
  });

  console.log('✅ Seasons created');

  // ==================== CREATE WORKSHOPS ====================
  console.log('🎨 Creating workshops...');
  
  const workshops = await Promise.all([
    prisma.workshop.create({
      data: {
        name: 'Danse Moderne',
        description: 'Cours de danse moderne pour tous niveaux, encadré par des professionnels',
        isActive: true,
      },
    }),
    prisma.workshop.create({
      data: {
        name: 'Théâtre',
        description: 'Atelier théâtre pour développer l\'expression orale et la confiance en soi',
        isActive: true,
      },
    }),
    prisma.workshop.create({
      data: {
        name: 'Musique',
        description: 'Initiation et perfectionnement musical (piano, guitare, chant)',
        isActive: true,
      },
    }),
    prisma.workshop.create({
      data: {
        name: 'Arts Plastiques',
        description: 'Peinture, dessin, sculpture - Exploration de la créativité artistique',
        isActive: true,
      },
    }),
    prisma.workshop.create({
      data: {
        name: 'Yoga',
        description: 'Cours de yoga et relaxation pour le bien-être physique et mental',
        isActive: true,
      },
    }),
    prisma.workshop.create({
      data: {
        name: 'Photographie',
        description: 'Apprentissage des techniques photo et développement de la créativité visuelle',
        isActive: true,
      },
    }),
    prisma.workshop.create({
      data: {
        name: 'Cuisine',
        description: 'Atelier cuisine créative et pâtisserie',
        isActive: false, // Inactif pour montrer la gestion des ateliers désactivés
      },
    }),
  ]);

  console.log('✅ Workshops created');

  // ==================== CREATE WORKSHOP PRICES ====================
  console.log('💰 Setting workshop prices...');
  
  const pricesData = [
    // Season 2023-2024
    { workshopId: workshops[0].id, seasonId: season2023.id, amount: 110 }, // Danse
    { workshopId: workshops[1].id, seasonId: season2023.id, amount: 90 },  // Théâtre
    { workshopId: workshops[2].id, seasonId: season2023.id, amount: 140 }, // Musique
    { workshopId: workshops[3].id, seasonId: season2023.id, amount: 80 },  // Arts Plastiques
    { workshopId: workshops[4].id, seasonId: season2023.id, amount: 70 },  // Yoga
    
    // Season 2024-2025 (active)
    { workshopId: workshops[0].id, seasonId: season2024.id, amount: 120 }, // Danse
    { workshopId: workshops[1].id, seasonId: season2024.id, amount: 100 }, // Théâtre
    { workshopId: workshops[2].id, seasonId: season2024.id, amount: 150 }, // Musique
    { workshopId: workshops[3].id, seasonId: season2024.id, amount: 85 },  // Arts Plastiques
    { workshopId: workshops[4].id, seasonId: season2024.id, amount: 75 },  // Yoga
    { workshopId: workshops[5].id, seasonId: season2024.id, amount: 95 },  // Photographie
    
    // Season 2025-2026 (future)
    { workshopId: workshops[0].id, seasonId: season2025.id, amount: 130 }, // Danse
    { workshopId: workshops[1].id, seasonId: season2025.id, amount: 110 }, // Théâtre
    { workshopId: workshops[2].id, seasonId: season2025.id, amount: 160 }, // Musique
  ];

  await prisma.workshopPrice.createMany({ data: pricesData });
  console.log('✅ Workshop prices set');

  // ==================== CREATE FAMILIES ====================
  console.log('👨‍👩‍👧‍👦 Creating families...');
  
  const families = await Promise.all([
    prisma.family.create({
      data: {
        name: 'Famille Dupont',
        address: '15 Rue des Lilas, 75001 Paris',
        phone: '0612345678',
        email: 'famille.dupont@example.com',
      },
    }),
    prisma.family.create({
      data: {
        name: 'Famille Martin',
        address: '42 Avenue Victor Hugo, 75016 Paris',
        phone: '0687654321',
        email: 'martin.family@example.com',
      },
    }),
    prisma.family.create({
      data: {
        name: 'Famille Bernard',
        address: '8 Boulevard Saint-Michel, 75005 Paris',
        phone: '0698765432',
        email: 'bernard.contact@example.com',
      },
    }),
    prisma.family.create({
      data: {
        name: 'Famille Dubois',
        address: '23 Rue Mouffetard, 75005 Paris',
        phone: '0623456789',
        email: 'dubois.famille@example.com',
      },
    }),
    prisma.family.create({
      data: {
        name: 'Famille Lefebvre',
        address: '56 Rue de Rivoli, 75004 Paris',
        phone: '0634567890',
        email: null, // Exemple sans email
      },
    }),
  ]);

  console.log('✅ Families created');

  // ==================== CREATE MEMBERS ====================
  console.log('👥 Creating members...');
  
  // Famille Dupont (4 membres)
  const jeanDupont = await prisma.member.create({
    data: {
      familyId: families[0].id,
      firstName: 'Jean',
      lastName: 'Dupont',
      email: 'jean.dupont@example.com',
      phone: '0612345678',
      isMinor: false,
    },
  });

  const marieDupont = await prisma.member.create({
    data: {
      familyId: families[0].id,
      firstName: 'Marie',
      lastName: 'Dupont',
      email: 'marie.dupont@example.com',
      phone: '0623456789',
      isMinor: false,
    },
  });

  const leaDupont = await prisma.member.create({
    data: {
      familyId: families[0].id,
      firstName: 'Léa',
      lastName: 'Dupont',
      isMinor: true,
      guardianFirstName: 'Jean',
      guardianLastName: 'Dupont',
      guardianEmail: 'jean.dupont@example.com',
      guardianPhone: '0612345678',
    },
  });

  const lucasDupont = await prisma.member.create({
    data: {
      familyId: families[0].id,
      firstName: 'Lucas',
      lastName: 'Dupont',
      isMinor: true,
      guardianFirstName: 'Marie',
      guardianLastName: 'Dupont',
      guardianEmail: 'marie.dupont@example.com',
      guardianPhone: '0623456789',
    },
  });

  // Famille Martin (3 membres)
  const sophieMartin = await prisma.member.create({
    data: {
      familyId: families[1].id,
      firstName: 'Sophie',
      lastName: 'Martin',
      email: 'sophie.martin@example.com',
      phone: '0687654321',
      isMinor: false,
    },
  });

  const camilleMartin = await prisma.member.create({
    data: {
      familyId: families[1].id,
      firstName: 'Camille',
      lastName: 'Martin',
      isMinor: true,
      guardianFirstName: 'Sophie',
      guardianLastName: 'Martin',
      guardianEmail: 'sophie.martin@example.com',
      guardianPhone: '0687654321',
    },
  });

  const thomasMartin = await prisma.member.create({
    data: {
      familyId: families[1].id,
      firstName: 'Thomas',
      lastName: 'Martin',
      isMinor: true,
      guardianFirstName: 'Sophie',
      guardianLastName: 'Martin',
      guardianEmail: 'sophie.martin@example.com',
      guardianPhone: '0687654321',
    },
  });

  // Famille Bernard (2 membres)
  const pierreBernard = await prisma.member.create({
    data: {
      familyId: families[2].id,
      firstName: 'Pierre',
      lastName: 'Bernard',
      email: 'pierre.bernard@example.com',
      phone: '0698765432',
      isMinor: false,
    },
  });

  const emmaBernard = await prisma.member.create({
    data: {
      familyId: families[2].id,
      firstName: 'Emma',
      lastName: 'Bernard',
      isMinor: true,
      guardianFirstName: 'Pierre',
      guardianLastName: 'Bernard',
      guardianEmail: 'pierre.bernard@example.com',
      guardianPhone: '0698765432',
    },
  });

  // Famille Dubois (1 membre adulte)
  const isabelleDubois = await prisma.member.create({
    data: {
      familyId: families[3].id,
      firstName: 'Isabelle',
      lastName: 'Dubois',
      email: 'isabelle.dubois@example.com',
      phone: '0623456789',
      isMinor: false,
    },
  });

  // Famille Lefebvre (2 membres)
  const julienLefebvre = await prisma.member.create({
    data: {
      familyId: families[4].id,
      firstName: 'Julien',
      lastName: 'Lefebvre',
      email: 'julien.lefebvre@example.com',
      isMinor: false,
    },
  });

  const chloeLeftevre = await prisma.member.create({
    data: {
      familyId: families[4].id,
      firstName: 'Chloé',
      lastName: 'Lefebvre',
      isMinor: true,
      guardianFirstName: 'Julien',
      guardianLastName: 'Lefebvre',
      guardianEmail: 'julien.lefebvre@example.com',
      guardianPhone: '0634567890',
    },
  });

  // Membre sans famille
  const patrickSolo = await prisma.member.create({
    data: {
      firstName: 'Patrick',
      lastName: 'Solo',
      email: 'patrick.solo@example.com',
      phone: '0645678901',
      isMinor: false,
    },
  });

  console.log('✅ Members created');

  // ==================== CREATE MEMBERSHIPS ====================
  console.log('📋 Creating memberships...');
  
  const membershipsData = [
    // Saison 2023 (passée)
    { memberId: jeanDupont.id, seasonId: season2023.id, amount: 45, status: 'validated' },
    { memberId: marieDupont.id, seasonId: season2023.id, amount: 45, status: 'validated' },
    { memberId: sophieMartin.id, seasonId: season2023.id, amount: 45, status: 'validated' },
    
    // Saison 2024 (active) - Famille Dupont
    { memberId: jeanDupont.id, seasonId: season2024.id, amount: 50, status: 'validated' },
    { memberId: marieDupont.id, seasonId: season2024.id, amount: 50, status: 'validated' },
    { memberId: leaDupont.id, seasonId: season2024.id, amount: 50, status: 'pending' },
    { memberId: lucasDupont.id, seasonId: season2024.id, amount: 50, status: 'pending' },
    
    // Saison 2024 - Famille Martin
    { memberId: sophieMartin.id, seasonId: season2024.id, amount: 50, status: 'validated' },
    { memberId: camilleMartin.id, seasonId: season2024.id, amount: 50, status: 'validated' },
    { memberId: thomasMartin.id, seasonId: season2024.id, amount: 50, status: 'pending' },
    
    // Saison 2024 - Autres
    { memberId: pierreBernard.id, seasonId: season2024.id, amount: 50, status: 'validated' },
    { memberId: isabelleDubois.id, seasonId: season2024.id, amount: 50, status: 'validated' },
    { memberId: patrickSolo.id, seasonId: season2024.id, amount: 50, status: 'pending' },
  ];

  await prisma.membership.createMany({ data: membershipsData });
  console.log('✅ Memberships created');

  // ==================== CREATE REGISTRATIONS & WORKSHOP REGISTRATIONS ====================
  console.log('📝 Creating registrations and workshop enrollments...');
  
  // Saison 2023 (passée)
  await prisma.registration.create({
    data: {
      memberId: jeanDupont.id,
      seasonId: season2023.id,
      familyOrder: 1,
      workshopRegistrations: {
        create: [
          { workshopId: workshops[0].id, appliedPrice: 110, discountPercent: 0 }, // Danse
          { workshopId: workshops[1].id, appliedPrice: 90, discountPercent: 0 },  // Théâtre
        ],
      },
    },
  });

  await prisma.registration.create({
    data: {
      memberId: marieDupont.id,
      seasonId: season2023.id,
      familyOrder: 2,
      workshopRegistrations: {
        create: [
          { workshopId: workshops[4].id, appliedPrice: 63, discountPercent: 10 }, // Yoga avec remise
        ],
      },
    },
  });

  // Saison 2024 (active) - Famille Dupont
  await prisma.registration.create({
    data: {
      memberId: jeanDupont.id,
      seasonId: season2024.id,
      familyOrder: 1,
      workshopRegistrations: {
        create: [
          { workshopId: workshops[0].id, appliedPrice: 120, discountPercent: 0 }, // Danse
          { workshopId: workshops[2].id, appliedPrice: 150, discountPercent: 0 }, // Musique
        ],
      },
    },
  });

  await prisma.registration.create({
    data: {
      memberId: marieDupont.id,
      seasonId: season2024.id,
      familyOrder: 2,
      workshopRegistrations: {
        create: [
          { workshopId: workshops[4].id, appliedPrice: 67.5, discountPercent: 10 }, // Yoga avec remise
          { workshopId: workshops[3].id, appliedPrice: 76.5, discountPercent: 10 }, // Arts Plastiques avec remise
        ],
      },
    },
  });

  await prisma.registration.create({
    data: {
      memberId: leaDupont.id,
      seasonId: season2024.id,
      familyOrder: 3,
      workshopRegistrations: {
        create: [
          { workshopId: workshops[1].id, appliedPrice: 90, discountPercent: 10 }, // Théâtre avec remise
        ],
      },
    },
  });

  await prisma.registration.create({
    data: {
      memberId: lucasDupont.id,
      seasonId: season2024.id,
      familyOrder: 4,
      workshopRegistrations: {
        create: [
          { workshopId: workshops[3].id, appliedPrice: 76.5, discountPercent: 10 }, // Arts Plastiques avec remise
        ],
      },
    },
  });

  // Famille Martin
  await prisma.registration.create({
    data: {
      memberId: sophieMartin.id,
      seasonId: season2024.id,
      familyOrder: 1,
      workshopRegistrations: {
        create: [
          { workshopId: workshops[5].id, appliedPrice: 95, discountPercent: 0 }, // Photographie
        ],
      },
    },
  });

  await prisma.registration.create({
    data: {
      memberId: camilleMartin.id,
      seasonId: season2024.id,
      familyOrder: 2,
      workshopRegistrations: {
        create: [
          { workshopId: workshops[0].id, appliedPrice: 108, discountPercent: 10 }, // Danse avec remise
          { workshopId: workshops[2].id, appliedPrice: 135, discountPercent: 10 }, // Musique avec remise
        ],
      },
    },
  });

  await prisma.registration.create({
    data: {
      memberId: thomasMartin.id,
      seasonId: season2024.id,
      familyOrder: 3,
      workshopRegistrations: {
        create: [
          { workshopId: workshops[1].id, appliedPrice: 90, discountPercent: 10 }, // Théâtre avec remise
        ],
      },
    },
  });

  // Autres membres
  await prisma.registration.create({
    data: {
      memberId: pierreBernard.id,
      seasonId: season2024.id,
      familyOrder: 1,
      workshopRegistrations: {
        create: [
          { workshopId: workshops[2].id, appliedPrice: 150, discountPercent: 0 }, // Musique
        ],
      },
    },
  });

  await prisma.registration.create({
    data: {
      memberId: isabelleDubois.id,
      seasonId: season2024.id,
      familyOrder: 1,
      workshopRegistrations: {
        create: [
          { workshopId: workshops[4].id, appliedPrice: 75, discountPercent: 0 }, // Yoga
          { workshopId: workshops[5].id, appliedPrice: 95, discountPercent: 0 }, // Photographie
        ],
      },
    },
  });

  await prisma.registration.create({
    data: {
      memberId: patrickSolo.id,
      seasonId: season2024.id,
      familyOrder: 1,
      workshopRegistrations: {
        create: [
          { workshopId: workshops[1].id, appliedPrice: 100, discountPercent: 0 }, // Théâtre
        ],
      },
    },
  });

  console.log('✅ Registrations and workshop enrollments created');

  // ==================== CREATE PAYMENTS ====================
  console.log('💳 Creating payments...');
  
  // Famille Dupont - Paiement partiel en attente
  await prisma.payment.create({
    data: {
      familyId: families[0].id,
      seasonId: season2024.id,
      amount: 300,
      paymentType: 'check',
      paymentDate: new Date('2024-09-15'),
      status: 'pending',
      reference: 'CHQ-2024-001',
      notes: 'Premier paiement partiel',
    },
  });

  // Famille Dupont - Paiement encaissé
  await prisma.payment.create({
    data: {
      familyId: families[0].id,
      seasonId: season2024.id,
      amount: 200,
      paymentType: 'check',
      paymentDate: new Date('2024-10-01'),
      cashingDate: new Date('2024-10-05'),
      status: 'cashed',
      reference: 'CHQ-2024-002',
      notes: 'Deuxième paiement',
    },
  });

  // Famille Martin - Paiement complet par carte
  await prisma.payment.create({
    data: {
      familyId: families[1].id,
      seasonId: season2024.id,
      amount: 483,
      paymentType: 'card',
      paymentDate: new Date('2024-09-20'),
      cashingDate: new Date('2024-09-20'),
      status: 'cashed',
      reference: 'CARD-2024-001',
      notes: 'Paiement total en une fois',
    },
  });

  // Pierre Bernard - Paiement par virement
  await prisma.payment.create({
    data: {
      memberId: pierreBernard.id,
      seasonId: season2024.id,
      amount: 200,
      paymentType: 'transfer',
      paymentDate: new Date('2024-09-25'),
      cashingDate: new Date('2024-09-25'),
      status: 'cashed',
      reference: 'VIRT-2024-001',
    },
  });

  // Isabelle Dubois - Paiement en espèces
  await prisma.payment.create({
    data: {
      memberId: isabelleDubois.id,
      seasonId: season2024.id,
      amount: 220,
      paymentType: 'cash',
      paymentDate: new Date('2024-10-10'),
      cashingDate: new Date('2024-10-10'),
      status: 'cashed',
      reference: 'CASH-2024-001',
    },
  });

  // Patrick Solo - Chèque non encaissé
  await prisma.payment.create({
    data: {
      memberId: patrickSolo.id,
      seasonId: season2024.id,
      amount: 150,
      paymentType: 'check',
      paymentDate: new Date('2024-11-05'),
      status: 'pending',
      reference: 'CHQ-2024-003',
    },
  });

  // Famille Lefebvre - Pas encore de paiement (pour exemple)

  console.log('✅ Payments created');

  // ==================== CREATE SHOW CLIENTS ====================
  console.log('🎭 Creating show clients...');
  
  const showClients = await Promise.all([
    prisma.showClient.create({
      data: {
        name: 'Mairie de Paris 15e',
        contactName: 'Marie Lenoir',
        email: 'marie.lenoir@paris15.fr',
        phone: '0145678901',
        address: '31 Rue Peclet, 75015 Paris',
        notes: 'Contact pour événements culturels municipaux',
      },
    }),
    prisma.showClient.create({
      data: {
        name: 'Association Quartier Latin',
        contactName: 'Jacques Dubois',
        email: 'j.dubois@quartier-latin.org',
        phone: '0156789012',
        address: '18 Rue Soufflot, 75005 Paris',
        notes: 'Organisation d\'événements associatifs',
      },
    }),
    prisma.showClient.create({
      data: {
        name: 'Théâtre de la Ville',
        contactName: 'Sophie Marchand',
        email: 'booking@theatre-ville.fr',
        phone: '0142741074',
        address: '2 Place du Châtelet, 75004 Paris',
        notes: 'Programmation spectacles tout public',
      },
    }),
    prisma.showClient.create({
      data: {
        name: 'Centre Culturel Le Trianon',
        contactName: 'Laurent Petit',
        email: 'contact@letrianon.fr',
        phone: '0144929878',
        address: '80 Boulevard de Rochechouart, 75018 Paris',
        notes: 'Salle de spectacle polyvalente',
      },
    }),
    prisma.showClient.create({
      data: {
        name: 'Comité d\'Entreprise TechCorp',
        contactName: 'Anne-Marie Rousseau',
        email: 'am.rousseau@techcorp.com',
        phone: '0178456789',
        address: '45 Avenue Montaigne, 75008 Paris',
        notes: 'Événements pour employés et familles',
      },
    }),
    prisma.showClient.create({
      data: {
        name: 'École Primaire Jean Jaurès',
        contactName: 'Directrice Dubois',
        email: 'ecole.jaures@ac-paris.fr',
        phone: '0143567890',
        address: '12 Rue Jean Jaurès, 75019 Paris',
        notes: 'Spectacles éducatifs pour enfants',
      },
    }),
    prisma.showClient.create({
      data: {
        name: 'Festival Arts en Scène',
        contactName: 'Pierre Martin',
        email: 'info@artsenscene.fr',
        phone: '0167890123',
        notes: 'Festival annuel d\'arts vivants',
      },
    }),
  ]);

  console.log('✅ Show clients created');

  // ==================== CREATE SHOWS ====================
  console.log('🎪 Creating shows...');
  
  const shows = await Promise.all([
    // Shows confirmés et réalisés
    prisma.show.create({
      data: {
        clientId: showClients[0].id, // Mairie de Paris 15e
        title: 'Spectacle de Fin d\'Année',
        description: 'Spectacle musical et théâtral pour célébrer la fin de l\'année scolaire',
        proposedDate: new Date('2024-06-20'),
        duration: 90,
        proposedPrice: 2500,
        status: 'paid',
        notes: 'Public familial, environ 200 personnes attendues',
      },
    }),
    prisma.show.create({
      data: {
        clientId: showClients[1].id, // Association Quartier Latin
        title: 'Gala de Bienfaisance',
        description: 'Soirée caritative avec spectacle de danse et théâtre',
        proposedDate: new Date('2024-10-15'),
        duration: 120,
        proposedPrice: 3500,
        status: 'paid',
        notes: 'Événement de prestige, cocktail inclus',
      },
    }),
    prisma.show.create({
      data: {
        clientId: showClients[2].id, // Théâtre de la Ville
        title: 'Représentation Théâtrale',
        description: 'Pièce de théâtre contemporaine par la troupe AFDA',
        proposedDate: new Date('2023-12-10'),
        duration: 75,
        proposedPrice: 2000,
        status: 'paid',
        notes: 'Spectacle passé - Grande réussite',
      },
    }),
    
    // Shows en cours de négociation
    prisma.show.create({
      data: {
        clientId: showClients[3].id, // Centre Culturel Le Trianon
        title: 'Showcase Danse Moderne',
        description: 'Démonstration des créations de l\'atelier danse moderne',
        proposedDate: new Date('2025-03-15'),
        duration: 60,
        proposedPrice: 1800,
        status: 'pending',
        notes: 'En attente de confirmation de la date',
      },
    }),
    prisma.show.create({
      data: {
        clientId: showClients[4].id, // Comité d\'Entreprise TechCorp
        title: 'Animation Soirée d\'Entreprise',
        description: 'Spectacle interactif et animations pour soirée corporate',
        proposedDate: new Date('2025-01-20'),
        duration: 90,
        proposedPrice: 4500,
        status: 'pending',
        notes: 'Client intéressé, négociation du tarif en cours',
      },
    }),
    
    // Shows pour écoles
    prisma.show.create({
      data: {
        clientId: showClients[5].id, // École Primaire Jean Jaurès
        title: 'Spectacle Pédagogique',
        description: 'Spectacle éducatif sur le thème de l\'environnement',
        proposedDate: new Date('2024-11-25'),
        duration: 45,
        proposedPrice: 800,
        status: 'paid',
        notes: 'Public : 150 élèves de primaire',
      },
    }),
    prisma.show.create({
      data: {
        clientId: showClients[5].id, // École Primaire Jean Jaurès (2e spectacle)
        title: 'Contes et Légendes',
        description: 'Spectacle de contes théâtralisés pour les plus jeunes',
        proposedDate: new Date('2025-04-10'),
        duration: 40,
        proposedPrice: 750,
        status: 'pending',
        notes: 'Demande de devis en cours',
      },
    }),
    
    // Festival
    prisma.show.create({
      data: {
        clientId: showClients[6].id, // Festival Arts en Scène
        title: 'Performance Multidisciplinaire',
        description: 'Spectacle mêlant danse, théâtre et musique live',
        proposedDate: new Date('2025-06-30'),
        duration: 100,
        proposedPrice: 5000,
        status: 'pending',
        notes: 'Participation au festival d\'été - Grande scène',
      },
    }),
    
    // Shows annulés ou refusés
    prisma.show.create({
      data: {
        clientId: showClients[0].id, // Mairie de Paris 15e
        title: 'Spectacle de Carnaval',
        description: 'Animation pour le carnaval du quartier',
        proposedDate: new Date('2025-02-15'),
        duration: 60,
        proposedPrice: 1500,
        status: 'cancelled',
        notes: 'Annulé par le client pour raisons budgétaires',
      },
    }),
  ]);

  console.log('✅ Shows created');

  // ==================== CREATE SHOW PAYMENTS ====================
  console.log('💵 Creating show payments...');
  
  // Paiement pour Spectacle de Fin d'Année (Mairie Paris 15e) - Encaissé
  await prisma.payment.create({
    data: {
      showClientId: showClients[0].id,
      amount: 2500,
      paymentType: 'transfer',
      paymentDate: new Date('2024-06-25'),
      cashingDate: new Date('2024-06-26'),
      status: 'cashed',
      reference: 'VIRT-SHOW-2024-001',
      notes: `Paiement pour spectacle: ${shows[0].title}`,
    },
  });

  // Paiement pour Gala de Bienfaisance - Acompte encaissé
  await prisma.payment.create({
    data: {
      showClientId: showClients[1].id,
      amount: 1500,
      paymentType: 'check',
      paymentDate: new Date('2024-09-01'),
      cashingDate: new Date('2024-09-05'),
      status: 'cashed',
      reference: 'CHQ-SHOW-2024-001',
      notes: `Acompte 50% pour: ${shows[1].title}`,
    },
  });

  // Paiement pour Gala de Bienfaisance - Solde en attente
  await prisma.payment.create({
    data: {
      showClientId: showClients[1].id,
      amount: 2000,
      paymentType: 'check',
      paymentDate: new Date('2024-10-20'),
      status: 'pending',
      reference: 'CHQ-SHOW-2024-002',
      notes: `Solde pour: ${shows[1].title}`,
    },
  });

  // Paiement pour Représentation Théâtrale (passée) - Encaissé
  await prisma.payment.create({
    data: {
      showClientId: showClients[2].id,
      amount: 2000,
      paymentType: 'transfer',
      paymentDate: new Date('2023-12-15'),
      cashingDate: new Date('2023-12-15'),
      status: 'cashed',
      reference: 'VIRT-SHOW-2023-001',
      notes: `Paiement pour: ${shows[2].title}`,
    },
  });

  // Paiement pour Spectacle Pédagogique École - Encaissé
  await prisma.payment.create({
    data: {
      showClientId: showClients[5].id,
      amount: 800,
      paymentType: 'transfer',
      paymentDate: new Date('2024-12-01'),
      cashingDate: new Date('2024-12-02'),
      status: 'cashed',
      reference: 'VIRT-SHOW-2024-002',
      notes: `Paiement pour: ${shows[5].title} - École Jean Jaurès`,
    },
  });

  // Acompte pour Animation Soirée d'Entreprise (en négociation)
  await prisma.payment.create({
    data: {
      showClientId: showClients[4].id,
      amount: 2000,
      paymentType: 'card',
      paymentDate: new Date('2024-12-10'),
      cashingDate: new Date('2024-12-10'),
      status: 'cashed',
      reference: 'CARD-SHOW-2024-001',
      notes: `Acompte 44% pour: ${shows[4].title} - TechCorp`,
    },
  });

  console.log('✅ Show payments created');
}


main()
  .catch((e) => {
    console.error('❌ Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });