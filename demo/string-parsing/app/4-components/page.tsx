import ChildAsString from './components/ChildAsString';
import PropsAsString from './components/PropsAsString';
import ChildrenProp from './components/ChildrenProp';
import RenderingViaComponent from './components/RenderingViaComponent';
import WrapperComponent from './components/WrapperComponent';

export default function ComponentsPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="mb-8 text-3xl font-bold text-gray-900 dark:text-gray-100">
          4. Components - through props and children
        </h1>
        <div className="space-y-8">
          <section>
            <h2 className="mb-4 text-2xl font-semibold text-gray-800 dark:text-gray-200">
              4.1 Child element as string
            </h2>
            <ChildAsString />
          </section>
          <section>
            <h2 className="mb-4 text-2xl font-semibold text-gray-800 dark:text-gray-200">
              4.2 Props as string (visible to users)
            </h2>
            <PropsAsString />
          </section>
          <section>
            <h2 className="mb-4 text-2xl font-semibold text-gray-800 dark:text-gray-200">
              4.3 Children prop
            </h2>
            <ChildrenProp />
          </section>
          <section>
            <h2 className="mb-4 text-2xl font-semibold text-gray-800 dark:text-gray-200">
              4.4 Rendering via component
            </h2>
            <RenderingViaComponent />
          </section>
          <section>
            <h2 className="mb-4 text-2xl font-semibold text-gray-800 dark:text-gray-200">
              4.5 Wrapper component
            </h2>
            <WrapperComponent />
          </section>
        </div>
      </main>
    </div>
  );
}

