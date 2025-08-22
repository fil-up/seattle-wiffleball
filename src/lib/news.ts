import newsData from '@/data/news.json'

export interface NewsArticle {
  id: number
  slug: string
  title: string
  date: string
  excerpt: string
  featured: boolean
  content: string
  image?: string
}

// Simple Markdown to HTML converter
function convertMarkdownToHtml(markdown: string): string {
  return markdown
    // Convert bullet points to <ul> and <li> tags (do this first to avoid conflicts)
    .replace(/^\*\s+(.*?)$/gm, '<li class="ml-4 mb-1">$1</li>')
    // Wrap lists properly
    .replace(/(<li.*?<\/li>)/gs, '<ul class="list-disc ml-6 mb-4">$1</ul>')
    // Convert line breaks to <br> tags
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br>')
    // Convert **bold** to <strong> tags
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // Convert *italic* to <em> tags (but not if it's part of a list item)
    .replace(/(?<!<li[^>]*>.*)\*(.*?)\*(?![^<]*<\/li>)/g, '<em>$1</em>')
    // Convert ## headers to <h2> tags
    .replace(/^##\s+(.*?)$/gm, '<h2 class="text-2xl font-bold text-gray-900 mt-6 mb-4">$1</h2>')
    // Convert ### headers to <h3> tags
    .replace(/^###\s+(.*?)$/gm, '<h3 class="text-xl font-bold text-gray-900 mt-5 mb-3">$1</h3>')
    // Convert #### headers to <h4> tags
    .replace(/^####\s+(.*?)$/gm, '<h4 class="text-lg font-bold text-gray-900 mt-4 mb-2">$1</h4>')
    // Convert ##### headers to <h5> tags
    .replace(/^#####\s+(.*?)$/gm, '<h5 class="text-base font-bold text-gray-900 mt-3 mb-2">$1</h5>')
    // Wrap content in paragraphs (but not if it's already wrapped in tags)
    .replace(/^(?!<[h|u|o]|<li)(.*?)$/gm, '<p class="mb-4 leading-relaxed">$1</p>')
    // Clean up empty paragraphs
    .replace(/<p class="mb-4 leading-relaxed"><\/p>/g, '')
    // Clean up multiple <br> tags
    .replace(/<br><br>/g, '<br>')
    // Remove leading/trailing <p> tags
    .replace(/^<\/p>/, '')
    .replace(/<p>$/, '')
}

export function getNewsArticles(): NewsArticle[] {
  return newsData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export function getFeaturedArticle(): NewsArticle | null {
  const articles = getNewsArticles()
  return articles.find(article => article.featured) || articles[0] || null
}

export function getNewsArticle(slug: string): NewsArticle | null {
  return newsData.find(article => article.slug === slug) || null
}

export function getNewsArticleWithHtml(slug: string): NewsArticle & { htmlContent: string } | null {
  const article = getNewsArticle(slug)
  if (!article) return null

  return {
    ...article,
    htmlContent: convertMarkdownToHtml(article.content)
  }
}
