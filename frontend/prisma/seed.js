const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding AI-First CourseHub database...');
  console.log('📌 Strategy: 100% FREE AI-generated Tech/AI courses');

  // 1. Create Tech/AI focused categories
  console.log('\n📂 Creating Tech/AI categories...');
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: 'AI/ML',
        slug: 'ai-ml',
        description: 'Artificial Intelligence og Machine Learning',
        icon: '🤖',
        color: '#FF6A3D',
        sortOrder: 1
      }
    }),
    prisma.category.create({
      data: {
        name: 'Cloud Computing',
        slug: 'cloud-computing',
        description: 'AWS, Azure, GCP og cloud native development',
        icon: '☁️',
        color: '#7E6BF1',
        sortOrder: 2
      }
    }),
    prisma.category.create({
      data: {
        name: 'Frontend Development',
        slug: 'frontend-development',
        description: 'React, Vue, Angular og moderne frontend frameworks',
        icon: '🎨',
        color: '#61DAFB',
        sortOrder: 3
      }
    }),
    prisma.category.create({
      data: {
        name: 'Backend Development',
        slug: 'backend-development',
        description: 'Node.js, Python, Go og API development',
        icon: '⚙️',
        color: '#3C873A',
        sortOrder: 4
      }
    }),
    prisma.category.create({
      data: {
        name: 'DevOps',
        slug: 'devops',
        description: 'Docker, Kubernetes, CI/CD og infrastructure as code',
        icon: '🚀',
        color: '#326CE5',
        sortOrder: 5
      }
    }),
    prisma.category.create({
      data: {
        name: 'Data Engineering',
        slug: 'data-engineering',
        description: 'Data pipelines, ETL og big data processing',
        icon: '📊',
        color: '#FF9800',
        sortOrder: 6
      }
    })
  ]);
  console.log(`✅ Created ${categories.length} Tech/AI categories`);

  // 2. Create test companies (for B2B tracking)
  console.log('\n🏢 Creating test companies...');
  const companies = await Promise.all([
    prisma.company.create({
      data: {
        name: 'TechStartup ApS',
        email: 'admin@techstartup.dk',
        cvr: '12345678',
        phone: '+45 12 34 56 78',
        city: 'København',
        postalCode: '2100',
        website: 'https://techstartup.dk'
      }
    }),
    prisma.company.create({
      data: {
        name: 'DataDriven A/S',
        email: 'hr@datadriven.dk',
        cvr: '87654321',
        phone: '+45 87 65 43 21',
        city: 'Aarhus',
        postalCode: '8000',
        website: 'https://datadriven.dk'
      }
    })
  ]);
  console.log(`✅ Created ${companies.length} companies`);

  // 3. Create users with different roles
  console.log('\n👥 Creating users...');
  const users = await Promise.all([
    // Individual users (no company)
    prisma.user.create({
      data: {
        id: 'user-individual-001',
        email: 'sarah@example.com',
        firstName: 'Sarah',
        lastName: 'Nielsen',
        role: 'USER' // Individual learner
      }
    }),
    prisma.user.create({
      data: {
        id: 'user-individual-002',
        email: 'michael@example.com',
        firstName: 'Michael',
        lastName: 'Hansen',
        role: 'USER'
      }
    }),

    // Company users - TechStartup
    prisma.user.create({
      data: {
        id: 'company-admin-001',
        email: 'admin@techstartup.dk',
        firstName: 'Lars',
        lastName: 'Andersen',
        role: 'COMPANY_ADMIN',
        companyId: companies[0].id
      }
    }),
    prisma.user.create({
      data: {
        id: 'company-user-001',
        email: 'developer@techstartup.dk',
        firstName: 'Marie',
        lastName: 'Larsen',
        role: 'COMPANY_USER',
        companyId: companies[0].id
      }
    }),

    // Company users - DataDriven
    prisma.user.create({
      data: {
        id: 'company-admin-002',
        email: 'hr@datadriven.dk',
        firstName: 'Peter',
        lastName: 'Jensen',
        role: 'COMPANY_ADMIN',
        companyId: companies[1].id
      }
    }),

    // Super admin
    prisma.user.create({
      data: {
        id: 'super-admin-001',
        email: 'admin@coursehub.dk',
        firstName: 'System',
        lastName: 'Administrator',
        role: 'SUPER_ADMIN'
      }
    })
  ]);
  console.log(`✅ Created ${users.length} users`);

  // 4. Create AI-generated courses (MVP Phase 1)
  console.log('\n📚 Creating AI-generated courses...');
  const courses = await Promise.all([
    // Course 1: RAG Systems
    prisma.course.create({
      data: {
        title: 'Building Production-Ready RAG Systems',
        description: 'Learn to build Retrieval-Augmented Generation (RAG) systems from scratch. Covers vector databases, embedding models, retrieval strategies, and production deployment.',
        shortDesc: 'Build enterprise RAG systems with LLMs and vector databases',
        priceCents: 0, // FREE in Phase 1-3
        duration: '45 minutter',
        language: 'da',
        level: 'Intermediate',
        categoryId: categories[0].id, // AI/ML
        status: 'PUBLISHED',
        publishedAt: new Date(),

        // AI Generation Metadata
        isAIGenerated: true,
        aiModel: 'claude-sonnet-4-20250514',
        generationCostUsd: 1.85,
        generationTimeMinutes: 180,
        abTestVariant: 'A',
        engagementScore: 85,

        // Mock curriculum structure
        curriculumJson: {
          sections: [
            { id: 'intro', type: 'video', title: 'Introduction to RAG', durationMinutes: 8 },
            { id: 'vector-db', type: 'video', title: 'Vector Databases Deep Dive', durationMinutes: 12 },
            { id: 'quiz-1', type: 'quiz', title: 'Quiz: RAG Fundamentals', questions: 5 },
            { id: 'embedding', type: 'video', title: 'Embedding Strategies', durationMinutes: 10 },
            { id: 'hands-on', type: 'hands-on', title: 'Build Your First RAG', durationMinutes: 15 }
          ],
          estimatedTotalMinutes: 45
        },

        podcastUrl: 'https://storage.example.com/rag-systems-podcast.mp3',
        videoUrl: 'https://storage.example.com/rag-systems-full.mp4'
      }
    }),

    // Course 2: Kubernetes
    prisma.course.create({
      data: {
        title: 'Kubernetes for Modern Developers',
        description: 'Master Kubernetes deployment, scaling, and management. From local development with Minikube to production-grade clusters on cloud platforms.',
        shortDesc: 'Deploy and manage containerized apps with Kubernetes',
        priceCents: 0,
        duration: '50 minutter',
        language: 'da',
        level: 'Intermediate',
        categoryId: categories[4].id, // DevOps
        status: 'PUBLISHED',
        publishedAt: new Date(),

        isAIGenerated: true,
        aiModel: 'claude-sonnet-4-20250514',
        generationCostUsd: 1.92,
        generationTimeMinutes: 195,
        abTestVariant: 'B',
        engagementScore: 78,

        curriculumJson: {
          sections: [
            { id: 'k8s-intro', type: 'video', title: 'Kubernetes Architecture', durationMinutes: 10 },
            { id: 'pods-deploy', type: 'video', title: 'Pods & Deployments', durationMinutes: 12 },
            { id: 'quiz-k8s', type: 'quiz', title: 'Quiz: K8s Basics', questions: 6 },
            { id: 'services', type: 'video', title: 'Services & Networking', durationMinutes: 10 },
            { id: 'deploy-app', type: 'hands-on', title: 'Deploy a Real App', durationMinutes: 18 }
          ],
          estimatedTotalMinutes: 50
        },

        podcastUrl: 'https://storage.example.com/kubernetes-podcast.mp3',
        videoUrl: 'https://storage.example.com/kubernetes-full.mp4'
      }
    }),

    // Course 3: React Server Components
    prisma.course.create({
      data: {
        title: 'React Server Components & Next.js 15',
        description: 'Deep dive into React Server Components, Server Actions, and the new Next.js 15 App Router. Build blazing-fast web applications with zero client-side JavaScript.',
        shortDesc: 'Master modern React with Server Components',
        priceCents: 0,
        duration: '40 minutter',
        language: 'da',
        level: 'Advanced',
        categoryId: categories[2].id, // Frontend Development
        status: 'PUBLISHED',
        publishedAt: new Date(),

        isAIGenerated: true,
        aiModel: 'claude-sonnet-4-20250514',
        generationCostUsd: 1.67,
        generationTimeMinutes: 165,
        abTestVariant: 'A',
        engagementScore: 92,

        curriculumJson: {
          sections: [
            { id: 'rsc-intro', type: 'video', title: 'What are Server Components?', durationMinutes: 8 },
            { id: 'app-router', type: 'video', title: 'Next.js 15 App Router', durationMinutes: 10 },
            { id: 'quiz-rsc', type: 'quiz', title: 'Quiz: RSC Fundamentals', questions: 5 },
            { id: 'server-actions', type: 'video', title: 'Server Actions & Forms', durationMinutes: 9 },
            { id: 'build-app', type: 'hands-on', title: 'Build a Full-Stack App', durationMinutes: 13 }
          ],
          estimatedTotalMinutes: 40
        },

        podcastUrl: 'https://storage.example.com/react-rsc-podcast.mp3'
        // No video for this one (cost > $3)
      }
    }),

    // Course 4: LangChain Advanced
    prisma.course.create({
      data: {
        title: 'LangChain Advanced Patterns',
        description: 'Advanced LangChain techniques: agents, memory systems, custom tools, and production deployment patterns. Build autonomous AI applications.',
        shortDesc: 'Build autonomous AI agents with LangChain',
        priceCents: 0,
        duration: '55 minutter',
        language: 'da',
        level: 'Advanced',
        categoryId: categories[0].id, // AI/ML
        status: 'PUBLISHED',
        publishedAt: new Date(),

        isAIGenerated: true,
        aiModel: 'claude-sonnet-4-20250514',
        generationCostUsd: 2.10,
        generationTimeMinutes: 210,
        abTestVariant: 'A',
        engagementScore: 88,

        curriculumJson: {
          sections: [
            { id: 'agents-intro', type: 'video', title: 'LangChain Agents', durationMinutes: 12 },
            { id: 'memory', type: 'video', title: 'Memory Systems', durationMinutes: 10 },
            { id: 'quiz-agents', type: 'quiz', title: 'Quiz: Agents & Memory', questions: 7 },
            { id: 'tools', type: 'video', title: 'Custom Tools', durationMinutes: 11 },
            { id: 'build-agent', type: 'hands-on', title: 'Build an AI Agent', durationMinutes: 22 }
          ],
          estimatedTotalMinutes: 55
        },

        podcastUrl: 'https://storage.example.com/langchain-podcast.mp3',
        videoUrl: 'https://storage.example.com/langchain-full.mp4'
      }
    })
  ]);
  console.log(`✅ Created ${courses.length} AI-generated courses`);

  // 5. Create sample trend proposals (for admin review)
  console.log('\n🔥 Creating sample trend proposals...');
  const trendProposals = await Promise.all([
    prisma.trendProposal.create({
      data: {
        source: 'hackernews',
        sourceUrl: 'https://news.ycombinator.com/item?id=12345',
        sourceId: 'hn-12345',
        title: 'GPT-5 Training Techniques Leaked',
        description: 'New paper reveals OpenAI\'s training methodology for next-gen models',
        keywords: ['GPT-5', 'LLM', 'training', 'OpenAI'],
        trendScore: 450,
        status: 'PENDING',

        aiCourseProposal: {
          suggestedTitle: 'Training Large Language Models: GPT-5 Techniques',
          targetAudience: 'ML engineers, AI researchers',
          estimatedInterest: 'Very High',
          keyTopics: ['Model architecture', 'Training optimization', 'RLHF', 'Scaling laws'],
          rationale: 'Trending on HN with 450+ upvotes, high technical interest'
        },

        estimatedDurationMinutes: 45,
        estimatedGenerationCostUsd: 1.80,
        estimatedEngagementScore: 90
      }
    }),

    prisma.trendProposal.create({
      data: {
        source: 'github',
        sourceUrl: 'https://github.com/vercel/next.js/releases/tag/v16.0.0',
        sourceId: 'github-nextjs-v16',
        title: 'Next.js 16 Released with Partial Prerendering',
        description: 'Major release featuring Partial Prerendering (PPR) and improved performance',
        keywords: ['Next.js', 'React', 'PPR', 'performance'],
        trendScore: 320,
        status: 'APPROVED',

        aiCourseProposal: {
          suggestedTitle: 'Next.js 16: Mastering Partial Prerendering',
          targetAudience: 'Frontend developers, React developers',
          estimatedInterest: 'High',
          keyTopics: ['PPR fundamentals', 'Migration guide', 'Performance optimization'],
          rationale: 'Major framework release, 2500+ GitHub stars in 24h'
        },

        estimatedDurationMinutes: 40,
        estimatedGenerationCostUsd: 1.65,
        estimatedEngagementScore: 85,

        // This one is already generating
        generatedCourseId: courses[2].id,
        actualGenerationCostUsd: 1.67,
        actualGenerationTimeMinutes: 165
      }
    })
  ]);
  console.log(`✅ Created ${trendProposals.length} trend proposals`);

  // 6. Create sample course progress (users learning)
  console.log('\n📈 Creating sample course progress...');
  const courseProgress = await Promise.all([
    // Sarah learning RAG Systems (50% complete)
    prisma.courseProgress.create({
      data: {
        userId: users[0].id, // Sarah
        courseId: courses[0].id, // RAG Systems
        currentSectionId: 'embedding',
        completedSections: ['intro', 'vector-db', 'quiz-1'],
        progressPercentage: 50,
        totalTimeMinutes: 22,
        quizScores: { 'quiz-1': 80 },
        exercisesCompleted: {}
      }
    }),

    // Michael completed Kubernetes course
    prisma.courseProgress.create({
      data: {
        userId: users[1].id, // Michael
        courseId: courses[1].id, // Kubernetes
        currentSectionId: 'deploy-app',
        completedSections: ['k8s-intro', 'pods-deploy', 'quiz-k8s', 'services', 'deploy-app'],
        progressPercentage: 100,
        totalTimeMinutes: 52,
        completedAt: new Date(),
        quizScores: { 'quiz-k8s': 100 },
        exercisesCompleted: { 'deploy-app': true }
      }
    }),

    // Company user learning React
    prisma.courseProgress.create({
      data: {
        userId: users[3].id, // Marie (TechStartup developer)
        courseId: courses[2].id, // React Server Components
        currentSectionId: 'server-actions',
        completedSections: ['rsc-intro', 'app-router', 'quiz-rsc'],
        progressPercentage: 60,
        totalTimeMinutes: 28,
        quizScores: { 'quiz-rsc': 100 }
      }
    })
  ]);
  console.log(`✅ Created ${courseProgress.length} course progress records`);

  console.log('\n🎉 AI-First CourseHub seeding completed successfully!');
  console.log(`
📊 Summary:
   - ${categories.length} Tech/AI categories
   - ${companies.length} companies
   - ${users.length} users (${users.filter(u => u.role === 'USER').length} individual, ${users.filter(u => u.role.includes('COMPANY')).length} company)
   - ${courses.length} AI-generated courses (100% FREE)
   - ${trendProposals.length} trend proposals (${trendProposals.filter(t => t.status === 'PENDING').length} pending review)
   - ${courseProgress.length} users actively learning

🚀 MVP Phase 1 Ready:
   - All courses are AI-generated
   - All content is FREE
   - Focus: Tech/AI topics only
   - Next: Connect n8n for daily trend scraping
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
