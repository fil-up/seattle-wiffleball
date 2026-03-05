import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { remark } from 'remark'
import html from 'remark-html'

const newsDirectory = path.join(process.cwd(), 'content/news')

export interface NewsArticle {
  slug: string
  title: string
  date: string
  excerpt: string
  image?: string
  tag?: string
  featured?: boolean
}

export function getNewsArticles(): NewsArticle[] {
  const fileNames = fs.readdirSync(newsDirectory)
  const articles = fileNames
    .filter((name) => name.endsWith('.md'))
    .map((fileName) => {
      const slug = fileName.replace(/\.md$/, '')
      const fullPath = path.join(newsDirectory, fileName)
      const fileContents = fs.readFileSync(fullPath, 'utf8')
      const { data } = matter(fileContents)

      return {
        slug,
        title: data.title,
        date: data.date,
        excerpt: data.excerpt,
        image: data.image,
        tag: data.tag,
        featured: data.featured || false,
      }
    })

  return articles.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )
}

export function getFeaturedArticle(): NewsArticle | null {
  const articles = getNewsArticles()
  return articles.find((article) => article.featured) || articles[0] || null
}

export function getNewsArticle(slug: string): NewsArticle | null {
  try {
    const fullPath = path.join(newsDirectory, `${slug}.md`)
    const fileContents = fs.readFileSync(fullPath, 'utf8')
    const { data } = matter(fileContents)

    return {
      slug,
      title: data.title,
      date: data.date,
      excerpt: data.excerpt,
      image: data.image,
      tag: data.tag,
      featured: data.featured || false,
    }
  } catch {
    return null
  }
}

export async function getNewsArticleWithHtml(
  slug: string
): Promise<(NewsArticle & { htmlContent: string }) | null> {
  try {
    const fullPath = path.join(newsDirectory, `${slug}.md`)
    const fileContents = fs.readFileSync(fullPath, 'utf8')
    const { data, content } = matter(fileContents)

    const processed = await remark().use(html).process(content)
    const htmlContent = processed.toString()

    return {
      slug,
      title: data.title,
      date: data.date,
      excerpt: data.excerpt,
      image: data.image,
      tag: data.tag,
      featured: data.featured || false,
      htmlContent,
    }
  } catch {
    return null
  }
}
