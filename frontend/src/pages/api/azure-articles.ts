import type { NextApiRequest, NextApiResponse } from 'next'

/**
 * Azure Articles API
 *
 * Returns Azure topics/articles in a format compatible with the n8n workflow.
 * This replaces HackerNews as the source for trend proposals.
 *
 * Format matches what n8n expects:
 * - title: Article title
 * - url: Link to Azure docs/blog
 * - score: Trend score (higher = more important)
 * - id: Unique identifier for deduplication
 * - time: Unix timestamp
 */

type AzureArticle = {
  id: string
  title: string
  url: string
  description: string
  score: number
  time: number
  author: string
  keywords: string[]
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Curated Azure topics for course generation
  // These are the 8 topics you specified, formatted for n8n consumption
  const azureArticles: AzureArticle[] = [
    {
      id: 'azure-storage-account',
      title: 'Azure Storage Account: Komplet Guide til Cloud Storage',
      url: 'https://learn.microsoft.com/en-us/azure/storage/common/storage-account-overview',
      description: 'Lær hvordan Azure Storage Account fungerer som central lagringsplads for filer, dokumenter, billeder og data. Inkluderer Blob Storage, File Storage, Queue Storage og Table Storage.',
      score: 95,
      time: Math.floor(Date.now() / 1000),
      author: 'Microsoft Azure',
      keywords: ['Azure', 'Storage', 'Blob Storage', 'Cloud Storage', 'Data Management']
    },
    {
      id: 'azure-data-factory',
      title: 'Azure Data Factory (ADF): Orkestrering og Automatisering af Dataflows',
      url: 'https://learn.microsoft.com/en-us/azure/data-factory/introduction',
      description: 'Mestre Azure Data Factory til at orkestrere dataflows mellem systemer. Opret pipelines som dagligt kopierer, transformerer og flytter data uden at skrive meget kode.',
      score: 92,
      time: Math.floor(Date.now() / 1000) - 3600,
      author: 'Microsoft Azure',
      keywords: ['Azure', 'Data Factory', 'ETL', 'Data Pipeline', 'Integration', 'Automation']
    },
    {
      id: 'azure-ai-search',
      title: 'Azure AI Search / Cognitive Search: Søgning og Indeksering',
      url: 'https://learn.microsoft.com/en-us/azure/search/search-what-is-azure-search',
      description: 'Gør dine data søgbare med Azure AI Search. Indekser dokumenter fra Blob Storage og byg kraftfulde RAG-løsninger (Retrieval-Augmented Generation) med AI.',
      score: 90,
      time: Math.floor(Date.now() / 1000) - 7200,
      author: 'Microsoft Azure',
      keywords: ['Azure', 'AI Search', 'Cognitive Search', 'RAG', 'Indexing', 'Search']
    },
    {
      id: 'azure-openai-service',
      title: 'Azure OpenAI Service: GPT-4 og Sprogmodeller i Azure',
      url: 'https://learn.microsoft.com/en-us/azure/ai-services/openai/overview',
      description: 'Få adgang til GPT-4, GPT-4 Turbo og andre OpenAI-modeller gennem Azure. Byg chatbots, RAG-systemer og AI-applikationer med enterprise-grade sikkerhed.',
      score: 98,
      time: Math.floor(Date.now() / 1000) - 10800,
      author: 'Microsoft Azure',
      keywords: ['Azure', 'OpenAI', 'GPT-4', 'AI', 'Language Models', 'RAG']
    },
    {
      id: 'azure-app-service',
      title: 'Azure App Service & Container Apps: Hosting af Webapps og API\'er',
      url: 'https://learn.microsoft.com/en-us/azure/app-service/overview',
      description: 'Deploy og host webapplikationer, chatbots og API\'er med Azure App Service og Container Apps. Automatisk skalering og nem integration med andre Azure-tjenester.',
      score: 88,
      time: Math.floor(Date.now() / 1000) - 14400,
      author: 'Microsoft Azure',
      keywords: ['Azure', 'App Service', 'Container Apps', 'Hosting', 'Web Apps', 'API']
    },
    {
      id: 'azure-sql-cosmos-db',
      title: 'Azure SQL Database & Cosmos DB: Database-løsninger i Cloud',
      url: 'https://learn.microsoft.com/en-us/azure/azure-sql/database/sql-database-paas-overview',
      description: 'Vælg den rigtige database til dine behov. Azure SQL Database til relationel data, Cosmos DB til global NoSQL. Gem metadata, logs, brugersessioner og mere.',
      score: 87,
      time: Math.floor(Date.now() / 1000) - 18000,
      author: 'Microsoft Azure',
      keywords: ['Azure', 'SQL Database', 'Cosmos DB', 'Database', 'NoSQL', 'Data Storage']
    },
    {
      id: 'azure-key-vault',
      title: 'Azure Key Vault: Sikker Håndtering af Secrets og Nøgler',
      url: 'https://learn.microsoft.com/en-us/azure/key-vault/general/overview',
      description: 'Opbevar API-nøgler, passwords, certificates og connection strings sikkert i Azure Key Vault. Undgå hardcoded credentials og styrk din applikations sikkerhed.',
      score: 91,
      time: Math.floor(Date.now() / 1000) - 21600,
      author: 'Microsoft Azure',
      keywords: ['Azure', 'Key Vault', 'Security', 'Secrets Management', 'Credentials']
    },
    {
      id: 'azure-monitor-insights',
      title: 'Azure Monitor & Application Insights: Overvågning og Logging',
      url: 'https://learn.microsoft.com/en-us/azure/azure-monitor/overview',
      description: 'Overvåg dine Azure-ressourcer med Azure Monitor og Application Insights. Saml metrics, logs og traces fra Data Factory-pipelines, webapps og AI-tjenester.',
      score: 85,
      time: Math.floor(Date.now() / 1000) - 25200,
      author: 'Microsoft Azure',
      keywords: ['Azure', 'Monitor', 'Application Insights', 'Logging', 'Observability', 'Metrics']
    }
  ]

  // Support pagination (similar to HackerNews API)
  const limit = parseInt(req.query.limit as string) || azureArticles.length
  const offset = parseInt(req.query.offset as string) || 0

  const paginatedArticles = azureArticles.slice(offset, offset + limit)

  res.status(200).json({
    success: true,
    source: 'azure-docs',
    count: paginatedArticles.length,
    total: azureArticles.length,
    articles: paginatedArticles
  })
}
