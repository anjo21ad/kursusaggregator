require('dotenv').config({ path: require('path').join(__dirname, '../.env.local') })
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('🚀 Starting to create test data...')

  // Create or get categories
  console.log('📁 Creating/getting categories...')
  const categoryData = [
    { name: 'Ledelse & Management', slug: 'ledelse', description: 'Kurser i ledelse og management' },
    { name: 'IT & Teknologi', slug: 'it-teknologi', description: 'Kurser i IT og teknologi' },
    { name: 'Salg & Marketing', slug: 'salg-marketing', description: 'Kurser i salg og marketing' },
    { name: 'HR & Personale', slug: 'hr-personale', description: 'Kurser i HR og personalepleje' },
    { name: 'Økonomi & Regnskab', slug: 'okonomi', description: 'Kurser i økonomi og regnskab' },
    { name: 'Kommunikation', slug: 'kommunikation', description: 'Kurser i kommunikation' },
  ]

  const categories = []
  for (const cat of categoryData) {
    // Try to find by slug first, then by name
    let category = await prisma.category.findFirst({
      where: {
        OR: [
          { slug: cat.slug },
          { name: cat.name }
        ]
      }
    })
    if (!category) {
      category = await prisma.category.create({ data: cat })
      console.log(`  ✅ Created category: ${cat.name}`)
    } else {
      console.log(`  ⏭️  Category exists: ${category.name}`)
    }
    categories.push(category)
  }
  console.log(`✅ ${categories.length} categories ready`)

  // Create or get providers
  console.log('🏢 Creating/getting providers...')
  const providerData = [
    {
      companyName: 'Danske Kurser A/S',
      contactEmail: 'kontakt@danskekurser.dk',
      phone: '+45 12 34 56 78',
      website: 'https://danskekurser.dk',
      description: 'Førende kursusudbyder i Danmark',
      city: 'København',
      postalCode: '2100',
      cvr: '12345678',
      status: 'APPROVED',
      approvedAt: new Date()
    },
    {
      companyName: 'Kompetence Akademiet',
      contactEmail: 'info@kompetenceakademiet.dk',
      phone: '+45 23 45 67 89',
      website: 'https://kompetenceakademiet.dk',
      description: 'Specialister i ledelsesudvikling',
      city: 'Aarhus',
      postalCode: '8000',
      cvr: '23456789',
      status: 'APPROVED',
      approvedAt: new Date()
    },
    {
      companyName: 'IT Akademiet',
      contactEmail: 'kontakt@itakademiet.dk',
      phone: '+45 34 56 78 90',
      website: 'https://itakademiet.dk',
      description: 'IT kurser for professionelle',
      city: 'Odense',
      postalCode: '5000',
      cvr: '34567890',
      status: 'APPROVED',
      approvedAt: new Date()
    },
  ]

  const providers = []
  for (const prov of providerData) {
    let provider = await prisma.provider.findUnique({ where: { contactEmail: prov.contactEmail } })
    if (!provider) {
      provider = await prisma.provider.create({ data: prov })
      console.log(`  ✅ Created provider: ${prov.companyName}`)
    } else {
      console.log(`  ⏭️  Provider exists: ${prov.companyName}`)
    }
    providers.push(provider)
  }
  console.log(`✅ ${providers.length} providers ready`)

  // Create 20 test courses
  console.log('📚 Creating 20 test courses...')
  const courses = [
    {
      title: 'Strategisk Ledelse i Praksis',
      shortDesc: 'Lær at udvikle og implementere effektive strategier',
      description: 'Dette kursus giver dig værktøjerne til at udvikle og implementere strategier, der skaber reel værdi for din virksomhed. Du lærer om strategisk analyse, stakeholder management og agil strategiudvikling.',
      priceCents: 1499500,
      duration: '3 dage',
      maxParticipants: 20,
      location: 'København',
      level: 'Avanceret',
      categorySlug: 'ledelse',
      providerEmail: 'info@kompetenceakademiet.dk'
    },
    {
      title: 'Python Programmering for Begyndere',
      shortDesc: 'Start din rejse inden for programmering med Python',
      description: 'Lær Python fra bunden. Dette kursus dækker alt fra variabler og datatyper til funktioner, klasser og praktiske projekter. Perfekt for dem uden tidligere programmeringserfaring.',
      priceCents: 899500,
      duration: '5 dage',
      maxParticipants: 15,
      location: 'Online',
      level: 'Begynder',
      categorySlug: 'it-teknologi',
      providerEmail: 'kontakt@itakademiet.dk'
    },
    {
      title: 'Digital Marketing & SEO',
      shortDesc: 'Boost din virksomheds online tilstedeværelse',
      description: 'Lær de nyeste teknikker inden for digital marketing, SEO og content marketing. Kurset dækker Google Ads, sociale medier, e-mail marketing og analyse af resultater.',
      priceCents: 1199500,
      duration: '2 dage',
      maxParticipants: 25,
      location: 'Aarhus',
      level: 'Mellem',
      categorySlug: 'salg-marketing',
      providerEmail: 'kontakt@danskekurser.dk'
    },
    {
      title: 'Effektiv Konfliktløsning på Arbejdspladsen',
      shortDesc: 'Håndter konflikter konstruktivt og professionelt',
      description: 'Dette kursus giver dig værktøjer til at identificere, forebygge og løse konflikter på arbejdspladsen. Du lærer om forskellige konfliktstile, mediering og konstruktiv kommunikation.',
      priceCents: 649500,
      duration: '1 dag',
      maxParticipants: 18,
      location: 'København',
      level: 'Begynder',
      categorySlug: 'hr-personale',
      providerEmail: 'info@kompetenceakademiet.dk'
    },
    {
      title: 'Avanceret Excel for Økonomimedarbejdere',
      shortDesc: 'Mestre Excel til økonomistyring og rapportering',
      description: 'Dyk ned i Excels avancerede funktioner som pivot-tabeller, makroer, VBA og avancerede formler. Perfekt til økonomimedarbejdere der vil optimere deres arbejdsgange.',
      priceCents: 799500,
      duration: '2 dage',
      maxParticipants: 12,
      location: 'Online',
      level: 'Avanceret',
      categorySlug: 'okonomi',
      providerEmail: 'kontakt@danskekurser.dk'
    },
    {
      title: 'Agil Projektledelse med Scrum',
      shortDesc: 'Implementer Scrum i din organisation',
      description: 'Lær at lede agile projekter med Scrum-framework. Kurset dækker roller, ceremonier, artifacts og hvordan du får mest ud af agile metoder i praksis.',
      priceCents: 1349500,
      duration: '3 dage',
      maxParticipants: 16,
      location: 'København',
      level: 'Mellem',
      categorySlug: 'ledelse',
      providerEmail: 'info@kompetenceakademiet.dk'
    },
    {
      title: 'Cloud Computing med AWS',
      shortDesc: 'Byg skalerbare løsninger i Amazon Web Services',
      description: 'Kom godt i gang med AWS. Lær om EC2, S3, Lambda, RDS og andre centrale tjenester. Inkluderer hands-on workshops og best practices for cloud-arkitektur.',
      priceCents: 1599500,
      duration: '4 dage',
      maxParticipants: 12,
      location: 'Online',
      level: 'Mellem',
      categorySlug: 'it-teknologi',
      providerEmail: 'kontakt@itakademiet.dk'
    },
    {
      title: 'Salgsteknik og Forhandling',
      shortDesc: 'Bliv en bedre sælger og forhandler',
      description: 'Dette intensive kursus giver dig konkrete værktøjer til at forbedre dine salgsfærdigheder. Lær om kundeadfærd, behovsanalyse, præsentationsteknik og forhandlingsstrategier.',
      priceCents: 999500,
      duration: '2 dage',
      maxParticipants: 20,
      location: 'Odense',
      level: 'Begynder',
      categorySlug: 'salg-marketing',
      providerEmail: 'kontakt@danskekurser.dk'
    },
    {
      title: 'Rekruttering og Onboarding',
      shortDesc: 'Optimer dine rekrutteringsprocesser',
      description: 'Lær best practices for moderne rekruttering, fra jobopslag til onboarding. Kurset dækker kandidatevaluering, interview-teknikker og effektiv onboarding.',
      priceCents: 849500,
      duration: '1.5 dage',
      maxParticipants: 15,
      location: 'Aarhus',
      level: 'Mellem',
      categorySlug: 'hr-personale',
      providerEmail: 'info@kompetenceakademiet.dk'
    },
    {
      title: 'Årsregnskab og Finansiel Rapportering',
      shortDesc: 'Forstå og udarbejd årsregnskaber',
      description: 'Grundig gennemgang af årsregnskabsloven, regnskabsprincipper og finansiel rapportering. Inkluderer praksis cases og aktuelle eksempler.',
      priceCents: 1099500,
      duration: '2 dage',
      maxParticipants: 20,
      location: 'København',
      level: 'Avanceret',
      categorySlug: 'okonomi',
      providerEmail: 'kontakt@danskekurser.dk'
    },
    {
      title: 'Præsentationsteknik og Storytelling',
      shortDesc: 'Bliv en bedre præsentator og fortæller',
      description: 'Lær at skabe engagerende præsentationer der fanger publikum. Kurset dækker storytelling, kropssprog, stemmeføring og håndtering af nervøsitet.',
      priceCents: 599500,
      duration: '1 dag',
      maxParticipants: 16,
      location: 'Online',
      level: 'Begynder',
      categorySlug: 'kommunikation',
      providerEmail: 'kontakt@danskekurser.dk'
    },
    {
      title: 'Change Management og Transformation',
      shortDesc: 'Led succesfulde forandringsprocesser',
      description: 'Dette kursus giver dig værktøjer til at lede og implementere forandringer i organisationer. Lær om modstandshåndtering, kommunikation og kulturforandring.',
      priceCents: 1299500,
      duration: '3 dage',
      maxParticipants: 18,
      location: 'København',
      level: 'Avanceret',
      categorySlug: 'ledelse',
      providerEmail: 'info@kompetenceakademiet.dk'
    },
    {
      title: 'Cybersecurity Fundamentals',
      shortDesc: 'Beskyt din virksomhed mod cyberangreb',
      description: 'Grundlæggende cybersecurity for IT-professionelle. Lær om trusler, sårbarheder, kryptering, netværkssikkerhed og incident response.',
      priceCents: 1449500,
      duration: '3 dage',
      maxParticipants: 14,
      location: 'Online',
      level: 'Mellem',
      categorySlug: 'it-teknologi',
      providerEmail: 'kontakt@itakademiet.dk'
    },
    {
      title: 'Content Marketing Strategi',
      shortDesc: 'Skab indhold der konverterer',
      description: 'Lær at udvikle og eksekvere effektive content marketing strategier. Kurset dækker buyer personas, content planning, distribution og måling af resultater.',
      priceCents: 949500,
      duration: '2 dage',
      maxParticipants: 22,
      location: 'Aarhus',
      level: 'Mellem',
      categorySlug: 'salg-marketing',
      providerEmail: 'kontakt@danskekurser.dk'
    },
    {
      title: 'Performance Management',
      shortDesc: 'Optimer medarbejderpræstationer',
      description: 'Lær at implementere effektive performance management systemer. Inkluderer goal-setting, feedback, coaching og performance reviews.',
      priceCents: 899500,
      duration: '2 dage',
      maxParticipants: 16,
      location: 'København',
      level: 'Mellem',
      categorySlug: 'hr-personale',
      providerEmail: 'info@kompetenceakademiet.dk'
    },
    {
      title: 'Budgettering og Økonomistyring',
      shortDesc: 'Skab realistiske budgetter og hold dem',
      description: 'Praktisk kursus i budgetlægning, forecasting og økonomisk opfølgning. Lær best practices og få værktøjer til effektiv økonomistyring.',
      priceCents: 999500,
      duration: '2 dage',
      maxParticipants: 18,
      location: 'Odense',
      level: 'Begynder',
      categorySlug: 'okonomi',
      providerEmail: 'kontakt@danskekurser.dk'
    },
    {
      title: 'Mødefacilitering og Workshops',
      shortDesc: 'Led produktive møder og workshops',
      description: 'Bliv en bedre mødeleder og facilitator. Lær metoder til at strukturere møder, engagere deltagere og sikre konkrete resultater.',
      priceCents: 649500,
      duration: '1 dag',
      maxParticipants: 15,
      location: 'Online',
      level: 'Begynder',
      categorySlug: 'kommunikation',
      providerEmail: 'kontakt@danskekurser.dk'
    },
    {
      title: 'Data Science med Python',
      shortDesc: 'Analyser og visualiser data professionelt',
      description: 'Lær data science med Python. Kurset dækker pandas, NumPy, matplotlib, machine learning basics og hvordan du arbejder med store datasæt.',
      priceCents: 1699500,
      duration: '5 dage',
      maxParticipants: 12,
      location: 'København',
      level: 'Avanceret',
      categorySlug: 'it-teknologi',
      providerEmail: 'kontakt@itakademiet.dk'
    },
    {
      title: 'Social Media Marketing',
      shortDesc: 'Mestre sociale medier til business',
      description: 'Komplet guide til sociale medier marketing. Lær strategier for Facebook, Instagram, LinkedIn og TikTok. Inkluderer annoncering og community management.',
      priceCents: 849500,
      duration: '1.5 dage',
      maxParticipants: 25,
      location: 'Aarhus',
      level: 'Begynder',
      categorySlug: 'salg-marketing',
      providerEmail: 'kontakt@danskekurser.dk'
    },
    {
      title: 'Employer Branding',
      shortDesc: 'Byg et stærkt employer brand',
      description: 'Lær at udvikle og kommunikere dit employer brand. Kurset dækker employer value proposition, kandidateoplevelse og måling af employer brand.',
      priceCents: 1149500,
      duration: '2 dage',
      maxParticipants: 20,
      location: 'København',
      level: 'Mellem',
      categorySlug: 'hr-personale',
      providerEmail: 'info@kompetenceakademiet.dk'
    },
  ]

  let createdCount = 0
  for (const courseData of courses) {
    const category = categories.find(c => c.slug === courseData.categorySlug)
    const provider = providers.find(p => p.contactEmail === courseData.providerEmail)

    if (!category) {
      console.log(`❌ Category not found for slug: ${courseData.categorySlug}`)
      continue
    }

    if (!provider) {
      console.log(`❌ Provider not found for email: ${courseData.providerEmail}`)
      continue
    }

    // Check if course already exists
    const existing = await prisma.course.findFirst({
      where: { title: courseData.title }
    })

    if (existing) {
      console.log(`⏭️  Skipping "${courseData.title}" - already exists`)
      continue
    }

    await prisma.course.create({
      data: {
        title: courseData.title,
        shortDesc: courseData.shortDesc,
        description: courseData.description,
        priceCents: courseData.priceCents,
        duration: courseData.duration,
        maxParticipants: courseData.maxParticipants,
        location: courseData.location,
        level: courseData.level,
        language: 'da',
        status: 'PUBLISHED',
        isActive: true,
        publishedAt: new Date(),
        categoryId: category.id,
        providerId: provider.id,
      }
    })
    createdCount++
    console.log(`  ✅ Created: ${courseData.title}`)
  }

  console.log(`\n✅ Created ${createdCount} new courses`)
  console.log('\n🎉 Test data created successfully!')
  console.log('\n📊 Summary:')
  console.log(`   - ${categories.length} categories`)
  console.log(`   - ${providers.length} providers`)
  console.log(`   - ${createdCount} new courses created`)
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
