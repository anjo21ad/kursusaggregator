const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Opret brugere
  const users = await Promise.all([
    prisma.user.create({
      data: {
        id: 'user-1',
        email: 'alice@example.com',
        role: 'USER',
      },
    }),
    prisma.user.create({
      data: {
        id: 'user-2',
        email: 'bob@example.com',
        role: 'USER',
      },
    }),
    prisma.user.create({
      data: {
        id: 'user-3',
        email: 'charlie@example.com',
        role: 'USER',
      },
    }),
  ]);
  console.log('Oprettede brugere:', users);

  // Opret kurser
  const courses = await Promise.all([
    prisma.course.create({
      data: {
        title: 'Introduktion til Python',
        description: 'Lær grundlæggende Python-programmering fra bunden.',
        priceCents: 49900, // 499,00 kr
        provider: 'xAI',
      },
    }),
    prisma.course.create({
      data: {
        title: 'Avanceret JavaScript',
        description: 'Dyk ned i avancerede JavaScript-koncepter og moderne frameworks.',
        priceCents: 79900, // 799,00 kr
        provider: 'TechUni',
      },
    }),
    prisma.course.create({
      data: {
        title: 'Dataanalyse med Power BI',
        description: 'Bliv ekspert i datavisualisering og analyse med Power BI.',
        priceCents: 64900, // 649,00 kr
        provider: 'DataPro',
      },
    }),
    prisma.course.create({
      data: {
        title: 'Webudvikling med React',
        description: 'Byg moderne webapps med React og Next.js.',
        priceCents: 59900, // 599,00 kr
        provider: 'CodeMasters',
      },
    }),
    prisma.course.create({
      data: {
        title: 'Grundlæggende SQL',
        description: 'Lær at arbejde med databaser og skrive effektive SQL-forespørgsler.',
        priceCents: 39900, // 399,00 kr
        provider: 'xAI',
      },
    }),
    prisma.course.create({
      data: {
        title: 'Machine Learning Basics',
        description: 'Introduktion til maskinlæring og dets anvendelser.',
        priceCents: 89900, // 899,00 kr
        provider: 'AI Academy',
      },
    }),
    prisma.course.create({
      data: {
        title: 'UX Design Principper',
        description: 'Forstå brugeroplevelser og design intuitive grænseflader.',
        priceCents: 54900, // 549,00 kr
        provider: 'DesignHub',
      },
    }),
    prisma.course.create({
      data: {
        title: 'C# for begyndere',
        description: 'Kom i gang med C# og byg dine egne applikationer.',
        priceCents: 44900, // 449,00 kr
        provider: 'TechUni',
      },
    }),
    prisma.course.create({
      data: {
        title: 'Cloud Computing med Azure',
        description: 'Lær at bruge Microsoft Azure til skybaserede løsninger.',
        priceCents: 74900, // 749,00 kr
        provider: 'CloudExperts',
      },
    }),
    prisma.course.create({
      data: {
        title: 'Agil Projektledelse',
        description: 'Forstå Scrum og Kanban og led projekter effektivt.',
        priceCents: 69900, // 699,00 kr
        provider: 'AgilePro',
      },
    }),
  ]);
  console.log('Oprettede kurser:', courses);

  // Opret køb (forbind brugere og kurser)
  const purchases = await Promise.all([
    prisma.purchase.create({
      data: {
        userId: users[0].id, // Alice
        courseId: courses[0].id, // Introduktion til Python
        createdAt: new Date(),
      },
    }),
    prisma.purchase.create({
      data: {
        userId: users[0].id, // Alice
        courseId: courses[1].id, // Avanceret JavaScript
        createdAt: new Date(),
      },
    }),
    prisma.purchase.create({
      data: {
        userId: users[1].id, // Bob
        courseId: courses[2].id, // Dataanalyse med Power BI
        createdAt: new Date(),
      },
    }),
    prisma.purchase.create({
      data: {
        userId: users[1].id, // Bob
        courseId: courses[4].id, // Grundlæggende SQL
        createdAt: new Date(),
      },
    }),
    prisma.purchase.create({
      data: {
        userId: users[2].id, // Charlie
        courseId: courses[6].id, // UX Design Principper
        createdAt: new Date(),
      },
    }),
  ]);
  console.log('Oprettede køb:', purchases);
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