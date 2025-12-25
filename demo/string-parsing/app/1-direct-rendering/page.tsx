import SimpleText from './components/SimpleText';
import TextBetweenElements from './components/TextBetweenElements';
import TextWithExplicitSpaces from './components/TextWithExplicitSpaces';
import TextWithSpaces from './components/TextWithSpaces';

export default function DirectRenderingPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="mb-8 text-3xl font-bold text-gray-900 dark:text-gray-100">
          1. Direct Rendering - JSXText between tags
        </h1>
        <div className="space-y-8">
          <section>
            <h2 className="mb-4 text-2xl font-semibold text-gray-800 dark:text-gray-200">
              1.1 Simple text between tags
            </h2>
            <SimpleText />
          </section>
          <section>
            <h2 className="mb-4 text-2xl font-semibold text-gray-800 dark:text-gray-200">
              1.2 Text with spaces
            </h2>
            <TextWithSpaces />
          </section>
          <section>
            <h2 className="mb-4 text-2xl font-semibold text-gray-800 dark:text-gray-200">
              1.3 Text with spaces between elements
            </h2>
            <TextBetweenElements />
          </section>
          <section>
            <h2 className="mb-4 text-2xl font-semibold text-gray-800 dark:text-gray-200">
              1.4 Text with explicit spaces via expression
            </h2>
            <TextWithExplicitSpaces />
          </section>
        </div>
      </main>
    </div>
  );
}
