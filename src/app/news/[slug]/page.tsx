import Link from 'next/link'
import Image from 'next/image'
import { getNewsArticleWithHtml, getNewsArticles } from '@/lib/news'
import { notFound } from 'next/navigation'

interface ArticlePageProps {
  params: {
    slug: string
  }
}

export async function generateStaticParams() {
  const articles = getNewsArticles()
  return articles.map((article) => ({
    slug: article.slug,
  }))
}

export default function ArticlePage({ params }: ArticlePageProps) {
  const article = getNewsArticleWithHtml(params.slug)

  if (!article) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-blue-600 text-white py-16">
        <div className="container mx-auto px-4">
          <Link 
            href="/news"
            className="text-blue-100 hover:text-white mb-4 inline-block"
          >
            ← Back to News
          </Link>
          <h1 className="text-4xl md:text-6xl font-bold mb-4">{article.title}</h1>
          <div className="flex items-center space-x-4">
            <div className="text-lg text-blue-100">{article.date}</div>
            {article.featured && (
              <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
                Featured Article
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Hero Image */}
      {article.image && (
        <div className="w-full overflow-hidden">
          <div className="relative w-full h-96">
            {/* Blurred background image */}
            <div className="absolute inset-0">
              <Image
                src={article.image}
                alt=""
                fill
                className="object-cover blur-2xl scale-125 opacity-40"
                priority
                unoptimized
              />
            </div>
            {/* Main image */}
            <div className="relative w-full h-full">
              <Image
                src={article.image}
                alt={article.title}
                fill
                className="object-contain"
                priority
                unoptimized
              />
            </div>
          </div>
        </div>
      )}

      {/* Article Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <article className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-8 md:p-12">
              <div className="prose prose-lg max-w-none">
                <div 
                  dangerouslySetInnerHTML={{ __html: article.htmlContent }}
                  className="text-gray-700 leading-relaxed"
                />
              </div>
              
              <div className="mt-12 pt-8 border-t border-gray-200">
                <Link 
                  href="/news"
                  className="text-blue-600 font-semibold hover:text-blue-800"
                >
                  ← Back to All News
                </Link>
              </div>
            </div>
          </article>
        </div>
      </div>
    </div>
  )
}
