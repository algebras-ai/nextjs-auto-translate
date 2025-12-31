import Portals from './components/Portals';
import SuspenseFallback from './components/SuspenseFallback';
import ErrorBoundary from './components/ErrorBoundary';

export default function SpecialCasesPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="mb-8 text-3xl font-bold text-gray-900 dark:text-gray-100">
          10. Special Cases - portals, Suspense, Error Boundary
        </h1>
        <div className="space-y-8">
          <section>
            <h2 className="mb-4 text-2xl font-semibold text-gray-800 dark:text-gray-200">
              10.1 Portals
            </h2>
            <Portals />
          </section>
          <section>
            <h2 className="mb-4 text-2xl font-semibold text-gray-800 dark:text-gray-200">
              10.2 Suspense with fallback
            </h2>
            <SuspenseFallback />
          </section>
          <section>
            <h2 className="mb-4 text-2xl font-semibold text-gray-800 dark:text-gray-200">
              10.3 Error Boundary with message
            </h2>
            <ErrorBoundary />
          </section>
        </div>
      </main>
    </div>
  );
}

