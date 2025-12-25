import TitleAttribute from './components/TitleAttribute';
import AltAttribute from './components/AltAttribute';
import AriaAttributes from './components/AriaAttributes';

export default function VisibleAttributesPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="mb-8 text-3xl font-bold text-gray-900 dark:text-gray-100">
          3. Visible Attributes - title, alt, aria-*
        </h1>
        <div className="space-y-8">
          <section>
            <h2 className="mb-4 text-2xl font-semibold text-gray-800 dark:text-gray-200">
              3.1 title attribute (tooltip)
            </h2>
            <TitleAttribute />
          </section>
          <section>
            <h2 className="mb-4 text-2xl font-semibold text-gray-800 dark:text-gray-200">
              3.2 alt attribute (alternative image text)
            </h2>
            <AltAttribute />
          </section>
          <section>
            <h2 className="mb-4 text-2xl font-semibold text-gray-800 dark:text-gray-200">
              3.3 Accessibility attributes (ARIA)
            </h2>
            <AriaAttributes />
          </section>
        </div>
      </main>
    </div>
  );
}

