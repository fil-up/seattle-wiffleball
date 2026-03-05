import Link from 'next/link'
import Image from 'next/image'
import { getNewsArticles } from '@/lib/news'

export default function NewsPage() {
  const articles = getNewsArticles()

  return (
    <div>
      {/* Header */}
      <div className="bg-brand-navy text-white py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">League News</h1>
          <p className="text-xl md:text-2xl text-blue-100">
            Stay updated with the latest from Seattle Wiffleball League
          </p>
        </div>
      </div>

      {/* News Articles */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {articles.map((article) => (
            <article key={article.slug} className="bg-surface-card rounded-lg shadow-md overflow-hidden">
              {article.image && (
                <div className="relative w-full h-48 overflow-hidden">
                  {/* Blurred background image */}
                  <div className="absolute inset-0">
                    <Image
                      src={article.image}
                      alt=""
                      fill
                      className="object-cover blur-lg scale-110 opacity-30"
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
                      unoptimized
                    />
                  </div>
                </div>
              )}
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-sm text-content-secondary">{article.date}</div>
                  {article.featured && (
                                      <span className="bg-brand-navy/20 text-brand-navy text-xs font-medium px-2.5 py-0.5 rounded">
                    Featured
                  </span>
                  )}
                </div>
                <h2 className="text-xl font-bold text-content-primary mb-3">
                  {article.title}
                </h2>
                <p className="text-content-secondary mb-4 leading-relaxed">
                  {article.excerpt}
                </p>
                <Link 
                  href={`/news/${article.slug}`}
                  className="text-brand-navy font-semibold hover:text-brand-navy/80"
                >
                  Read Full Article →
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  )
}
