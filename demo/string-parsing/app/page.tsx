import Link from 'next/link';

const scenarios = [
  {
    path: '/1-direct-rendering',
    title: '1. Direct Rendering',
    description: 'JSXText between tags (visible text)',
  },
  {
    path: '/2-expressions',
    title: '2. Expressions',
    description: 'JSXExpressionContainer with various expression types returning strings',
  },
  {
    path: '/3-visible-attributes',
    title: '3. Visible Attributes',
    description: 'JSXAttribute with title, alt, aria-label, aria-describedby, aria-placeholder and other accessibility attributes',
  },
  {
    path: '/4-components',
    title: '4. Components',
    description: 'Through props and children that render visible text',
  },
  {
    path: '/5-functions',
    title: '5. Functions',
    description: 'Through function calls returning strings for display',
  },
  {
    path: '/6-conditional-logic',
    title: '6. Conditional Logic',
    description: 'Through ternary operators and logical expressions returning strings',
  },
  {
    path: '/7-loops',
    title: '7. Loops',
    description: 'Through map, forEach and other array methods rendering strings',
  },
  {
    path: '/8-nextjs-specifics',
    title: '8. Next.js Specifics',
    description: 'Metadata (title, description), Server/Client Components',
  },
  {
    path: '/9-forms',
    title: '9. Forms',
    description: 'Placeholder, value, label text, button text, option text',
  },
  {
    path: '/10-special-cases',
    title: '10. Special Cases',
    description: 'Portals, Suspense fallback, Error Boundary',
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold text-gray-900 dark:text-gray-100">
            String Rendering Patterns
          </h1>
          <p className="mx-auto max-w-3xl text-lg text-gray-600 dark:text-gray-400">
            This demonstration shows all possible scenarios and patterns of how
            strings can appear in the final DOM in React and Next.js applications
            and be visible to users on screen (without using devtools).
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {scenarios.map((scenario) => (
            <Link
              key={scenario.path}
              href={scenario.path}
              className="group rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-all hover:border-blue-500 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:hover:border-blue-400"
            >
              <h2 className="mb-2 text-xl font-semibold text-gray-900 group-hover:text-blue-600 dark:text-gray-100 dark:group-hover:text-blue-400">
                {scenario.title}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">{scenario.description}</p>
            </Link>
          ))}
        </div>

        <div className="mt-12 rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <h2 className="mb-4 text-2xl font-semibold text-gray-900 dark:text-gray-100">
            Exclusions (not localized):
          </h2>
          <ul className="list-disc space-y-2 pl-6 text-gray-600 dark:text-gray-400">
            <li>
              Technical attributes: <code className="rounded bg-gray-100 px-1 dark:bg-gray-700 dark:text-gray-300">id</code>,{' '}
              <code className="rounded bg-gray-100 px-1 dark:bg-gray-700 dark:text-gray-300">className</code>,{' '}
              <code className="rounded bg-gray-100 px-1 dark:bg-gray-700 dark:text-gray-300">htmlFor</code>,{' '}
              <code className="rounded bg-gray-100 px-1 dark:bg-gray-700 dark:text-gray-300">data-*</code>,{' '}
              <code className="rounded bg-gray-100 px-1 dark:bg-gray-700 dark:text-gray-300">key</code>,{' '}
              <code className="rounded bg-gray-100 px-1 dark:bg-gray-700 dark:text-gray-300">ref</code>
            </li>
            <li>Pure API responses without UI</li>
            <li>Code comments</li>
            <li>Technical identifiers and CSS classes</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
