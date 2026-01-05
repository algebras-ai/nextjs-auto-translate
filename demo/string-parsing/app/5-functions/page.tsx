import ComponentFunction from './components/ComponentFunction';
import ArrowFunction from './components/ArrowFunction';
import ObjectMethod from './components/ObjectMethod';
import StringMethod from './components/StringMethod';
import UtilityFunction from './components/UtilityFunction';

export default function FunctionsPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="mb-8 text-3xl font-bold text-gray-900 dark:text-gray-100">
          5. Functions - through function calls
        </h1>
        <div className="space-y-8">
          <section>
            <h2 className="mb-4 text-2xl font-semibold text-gray-800 dark:text-gray-200">
              5.1 Component function
            </h2>
            <ComponentFunction />
          </section>
          <section>
            <h2 className="mb-4 text-2xl font-semibold text-gray-800 dark:text-gray-200">
              5.2 Arrow function
            </h2>
            <ArrowFunction />
          </section>
          <section>
            <h2 className="mb-4 text-2xl font-semibold text-gray-800 dark:text-gray-200">
              5.3 Object method
            </h2>
            <ObjectMethod />
          </section>
          <section>
            <h2 className="mb-4 text-2xl font-semibold text-gray-800 dark:text-gray-200">
              5.4 String method
            </h2>
            <StringMethod />
          </section>
          <section>
            <h2 className="mb-4 text-2xl font-semibold text-gray-800 dark:text-gray-200">
              5.5 Utility function
            </h2>
            <UtilityFunction />
          </section>
        </div>
      </main>
    </div>
  );
}

