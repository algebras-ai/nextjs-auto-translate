import Metadata from './components/Metadata';
import GenerateMetadata from './components/GenerateMetadata';
import ServerComponent from './components/ServerComponent';
import ClientComponent from './components/ClientComponent';

export const metadata = {
  title: '8. Next.js Specifics',
  description: 'Metadata, Server/Client Components',
};

export default function NextJsSpecificsPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="mb-8 text-3xl font-bold text-gray-900 dark:text-gray-100">
          8. Next.js Specifics - metadata, Server/Client Components
        </h1>
        <div className="space-y-8">
          <section>
            <h2 className="mb-4 text-2xl font-semibold text-gray-800 dark:text-gray-200">
              8.1 Metadata
            </h2>
            <Metadata />
          </section>
          <section>
            <h2 className="mb-4 text-2xl font-semibold text-gray-800 dark:text-gray-200">
              8.2 generateMetadata function
            </h2>
            <GenerateMetadata />
          </section>
          <section>
            <h2 className="mb-4 text-2xl font-semibold text-gray-800 dark:text-gray-200">
              8.3 Server Components
            </h2>
            <ServerComponent />
          </section>
          <section>
            <h2 className="mb-4 text-2xl font-semibold text-gray-800 dark:text-gray-200">
              8.4 Client Components
            </h2>
            <ClientComponent />
          </section>
        </div>
      </main>
    </div>
  );
}

