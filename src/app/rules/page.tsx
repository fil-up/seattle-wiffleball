import fs from 'fs'
import path from 'path'
import { remark } from 'remark'
import html from 'remark-html'

export default async function RulesPage() {
  const rulesPath = path.join(process.cwd(), 'content/rules.md')
  const rulesContent = fs.readFileSync(rulesPath, 'utf8')
  const processed = await remark().use(html).process(rulesContent)
  const htmlContent = processed.toString()

  return (
    <div>
      <div className="bg-brand-navy text-white py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">League Rules</h1>
          <p className="text-xl md:text-2xl text-blue-100">
            Official Seattle Wiffleball League Rules &amp; Regulations
          </p>
        </div>
      </div>
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto bg-surface-card rounded-lg shadow-md p-8 md:p-12">
          <div
            className="prose prose-lg dark:prose-invert max-w-none prose-headings:text-brand-navy prose-h2:border-b prose-h2:border-border prose-h2:pb-2 prose-h2:mt-10 prose-strong:text-content-primary"
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />
        </div>
      </div>
    </div>
  )
}
