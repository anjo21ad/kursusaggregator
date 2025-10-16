const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding B2B Kursusaggregator database...');

  // 1. Opret kategorier
  console.log('📂 Creating categories...');
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: 'IT & Teknologi',
        slug: 'it-teknologi',
        description: 'Programmering, webudvikling, databaser og tekniske færdigheder'
      }
    }),
    prisma.category.create({
      data: {
        name: 'Ledelse & Management',
        slug: 'ledelse-management', 
        description: 'Projektledelse, teamledelse og strategisk management'
      }
    }),
    prisma.category.create({
      data: {
        name: 'Salg & Marketing',
        slug: 'salg-marketing',
        description: 'Digital marketing, salgsteknikker og kundeservice'
      }
    }),
    prisma.category.create({
      data: {
        name: 'HR & Personaludvikling',
        slug: 'hr-personaludvikling',
        description: 'Rekruttering, medarbejderudvikling og organisationspsykologi'
      }
    }),
    prisma.category.create({
      data: {
        name: 'Økonomi & Regnskab',
        slug: 'oekonomi-regnskab',
        description: 'Bogholderi, finansiel analyse og økonomistyring'
      }
    })
  ]);
  console.log(`✅ Created ${categories.length} categories`);

  // 2. Opret test virksomheder
  console.log('🏢 Creating companies...');
  const companies = await Promise.all([
    prisma.company.create({
      data: {
        name: 'TechCorp ApS',
        email: 'admin@techcorp.dk',
        cvr: '12345678',
        phone: '+45 12 34 56 78',
        city: 'København',
        postalCode: '2100'
      }
    }),
    prisma.company.create({
      data: {
        name: 'InnovateLTD',
        email: 'hr@innovate.dk', 
        cvr: '87654321',
        phone: '+45 87 65 43 21',
        city: 'Aarhus',
        postalCode: '8000'
      }
    }),
    prisma.company.create({
      data: {
        name: 'GrowthPartners A/S',
        email: 'learning@growth.dk',
        cvr: '11223344',
        city: 'Odense',
        postalCode: '5000'
      }
    })
  ]);
  console.log(`✅ Created ${companies.length} companies`);

  // 3. Opret kursusudbydere
  console.log('🎓 Creating providers...');
  const providers = await Promise.all([
    prisma.provider.create({
      data: {
        companyName: 'TechAcademy Danmark',
        contactEmail: 'kontakt@techacademy.dk',
        phone: '+45 12 34 56 90',
        website: 'https://techacademy.dk',
        description: 'Danmarks største tekniske kursusudbyder med fokus på praktisk læring',
        city: 'København',
        cvr: '99887766',
        status: 'APPROVED',
        approvedAt: new Date()
      }
    }),
    prisma.provider.create({
      data: {
        companyName: 'Business Skills Pro',
        contactEmail: 'info@bizskills.dk', 
        phone: '+45 98 76 54 32',
        website: 'https://bizskills.dk',
        description: 'Specialister i ledelses- og projektledelseskurser',
        city: 'Aarhus',
        cvr: '55443322',
        status: 'APPROVED',
        approvedAt: new Date()
      }
    }),
    prisma.provider.create({
      data: {
        companyName: 'Digital Marketing Hub',
        contactEmail: 'hello@dmhub.dk',
        website: 'https://digitalmarketinghub.dk',
        description: 'Moderne marketing og salgsstrategier',
        city: 'Aalborg',
        cvr: '77889900',
        status: 'PENDING' // Denne venter på godkendelse
      }
    })
  ]);
  console.log(`✅ Created ${providers.length} providers`);

  // 4. Opret brugere med roller og virksomhedstilknytning
  console.log('👥 Creating users...');
  const users = await Promise.all([
    // TechCorp medarbejdere
    prisma.user.create({
      data: {
        id: 'tech-admin-001',
        email: 'admin@techcorp.dk',
        firstName: 'Lars',
        lastName: 'Nielsen',
        role: 'COMPANY_ADMIN',
        companyId: companies[0].id
      }
    }),
    prisma.user.create({
      data: {
        id: 'tech-user-001', 
        email: 'developer@techcorp.dk',
        firstName: 'Marie',
        lastName: 'Hansen',
        role: 'COMPANY_USER',
        companyId: companies[0].id
      }
    }),
    
    // InnovateLTD medarbejdere
    prisma.user.create({
      data: {
        id: 'innovate-admin-001',
        email: 'hr@innovate.dk',
        firstName: 'Peter',
        lastName: 'Andersen',
        role: 'COMPANY_ADMIN', 
        companyId: companies[1].id
      }
    }),
    
    // Provider administratorer
    prisma.user.create({
      data: {
        id: 'provider-tech-001',
        email: 'admin@techacademy.dk',
        firstName: 'Anna',
        lastName: 'Larsen',
        role: 'PROVIDER',
        providerId: providers[0].id
      }
    }),
    prisma.user.create({
      data: {
        id: 'provider-biz-001',
        email: 'admin@bizskills.dk', 
        firstName: 'Mikkel',
        lastName: 'Jensen',
        role: 'PROVIDER',
        providerId: providers[1].id
      }
    }),
    
    // Super admin
    prisma.user.create({
      data: {
        id: 'super-admin-001',
        email: 'admin@kursusaggregator.dk',
        firstName: 'System',
        lastName: 'Administrator',
        role: 'SUPER_ADMIN'
      }
    })
  ]);
  console.log(`✅ Created ${users.length} users`);

  // 5. Opret kurser med realistiske B2B data
  console.log('📚 Creating courses...');
  const courses = await Promise.all([
    // TechAcademy kurser
    prisma.course.create({
      data: {
        title: 'Full Stack JavaScript Development',
        description: 'Komplet uddannelse i moderne webudvikling med React, Node.js og databaser. Ideelt for udviklere der vil opbygge komplette webapplikationer.',
        shortDesc: 'Lær at bygge complete web apps fra bunden',
        priceCents: 1499500, // 14.995 kr (B2B pricing)
        duration: '5 dage',
        maxParticipants: 12,
        location: 'København eller Online',
        level: 'Intermediate',
        providerId: providers[0].id,
        categoryId: categories[0].id, // IT & Teknologi
        status: 'PUBLISHED',
        publishedAt: new Date()
      }
    }),
    prisma.course.create({
      data: {
        title: 'Python for Data Science',
        description: 'Intensiv kursus i Python programmering med fokus på dataanalyse, machine learning og visualisering.',
        shortDesc: 'Python dataanalyse og ML grundkursus',
        priceCents: 1299500, // 12.995 kr
        duration: '4 dage',
        maxParticipants: 16,
        location: 'København',
        level: 'Beginner', 
        providerId: providers[0].id,
        categoryId: categories[0].id,
        status: 'PUBLISHED',
        publishedAt: new Date()
      }
    }),
    prisma.course.create({
      data: {
        title: 'Cybersikkerhed for Ledere',
        description: 'Strategisk tilgang til cybersikkerhed - hvad ledere skal vide for at beskytte deres virksomhed.',
        shortDesc: 'Cyber security management og strategi',
        priceCents: 899500, // 8.995 kr
        duration: '2 dage',
        maxParticipants: 20,
        location: 'Online',
        level: 'Beginner',
        providerId: providers[0].id,
        categoryId: categories[1].id, // Ledelse & Management
        status: 'PUBLISHED',
        publishedAt: new Date()
      }
    }),
    
    // Business Skills Pro kurser
    prisma.course.create({
      data: {
        title: 'Agil Projektledelse & Scrum Master',
        description: 'Certificeret Scrum Master kursus med praktiske øvelser og reelle cases fra danske virksomheder.',
        shortDesc: 'Bliv certificeret Scrum Master',
        priceCents: 1899500, // 18.995 kr
        duration: '3 dage',
        maxParticipants: 16,
        location: 'Aarhus',
        level: 'Intermediate',
        providerId: providers[1].id,
        categoryId: categories[1].id,
        status: 'PUBLISHED', 
        publishedAt: new Date()
      }
    }),
    prisma.course.create({
      data: {
        title: 'Strategisk HR Ledelse',
        description: 'Udvikl dine HR-ledelsesevner med fokus på talentudvikling, performance management og organisationsudvikling.',
        shortDesc: 'Modern HR ledelse og talent management',
        priceCents: 1599500, // 15.995 kr
        duration: '3 dage',
        maxParticipants: 14,
        location: 'Online + 1 dag physical',
        level: 'Advanced',
        providerId: providers[1].id,
        categoryId: categories[3].id, // HR & Personaludvikling
        status: 'PUBLISHED',
        publishedAt: new Date()
      }
    }),
    
    // Draft kursus (ikke publiceret endnu)
    prisma.course.create({
      data: {
        title: 'Digital Marketing Masterclass',
        description: 'Avanceret digital marketing med focus på ROI og performance marketing.',
        shortDesc: 'Advanced digital marketing strategies',
        priceCents: 1199500, // 11.995 kr
        duration: '2 dage',
        maxParticipants: 20,
        location: 'Aalborg',
        level: 'Advanced',
        providerId: providers[2].id, // Pending provider
        categoryId: categories[2].id, // Salg & Marketing
        status: 'DRAFT' // Ikke publiceret
      }
    })
  ]);
  console.log(`✅ Created ${courses.length} courses`);

  // 6. Opret køb og leads
  console.log('💰 Creating purchases and leads...');
  const purchases = await Promise.all([
    prisma.purchase.create({
      data: {
        userId: users[1].id, // Marie fra TechCorp
        courseId: courses[0].id, // Full Stack JavaScript
        companyId: companies[0].id, // TechCorp
        priceCents: courses[0].priceCents,
        commission: Math.floor(courses[0].priceCents * 0.15), // 15% commission
        type: 'DIRECT_SALE'
      }
    }),
    prisma.purchase.create({
      data: {
        userId: users[2].id, // Peter fra InnovateLTD  
        courseId: courses[3].id, // Agil Projektledelse
        companyId: companies[1].id, // InnovateLTD
        priceCents: courses[3].priceCents,
        commission: Math.floor(courses[3].priceCents * 0.12), // 12% commission
        type: 'DIRECT_SALE'
      }
    })
  ]);

  const leads = await Promise.all([
    prisma.lead.create({
      data: {
        userId: users[0].id, // Lars (admin) fra TechCorp
        courseId: courses[2].id, // Cybersikkerhed for Ledere
        companyId: companies[0].id, // TechCorp
        providerId: providers[0].id, // TechAcademy
        message: 'Vi er interesserede i at få alle vores ledere gennem dette kursus. Kan I tilbyde grupperabat for 8 personer?',
        status: 'NEW'
      }
    }),
    prisma.lead.create({
      data: {
        userId: users[2].id, // Peter fra InnovateLTD
        courseId: courses[4].id, // Strategisk HR Ledelse  
        companyId: companies[1].id, // InnovateLTD
        providerId: providers[1].id, // Business Skills Pro
        message: 'Kan kurset tilpasses vores specifikke HR-udfordringer? Vi har brug for fokus på remote work management.',
        status: 'CONTACTED'
      }
    })
  ]);

  console.log(`✅ Created ${purchases.length} purchases and ${leads.length} leads`);

  console.log('🎉 Seeding completed successfully!');
  console.log(`
📊 Summary:
   - ${categories.length} categories
   - ${companies.length} companies  
   - ${providers.length} providers (${providers.filter(p => p.status === 'APPROVED').length} approved)
   - ${users.length} users
   - ${courses.length} courses (${courses.filter(c => c.status === 'PUBLISHED').length} published)
   - ${purchases.length} purchases
   - ${leads.length} leads
  `);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });