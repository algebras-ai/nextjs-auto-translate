import MapWithStrings from './components/MapWithStrings';
import MapWithFormatting from './components/MapWithFormatting';
import ForEachJoin from './components/ForEachJoin';
import FilterMap from './components/FilterMap';
import ReduceCombine from './components/ReduceCombine';

export default function LoopsPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="mb-8 text-3xl font-bold text-gray-900 dark:text-gray-100">
          7. Loops - map, forEach
        </h1>
        <div className="space-y-8">
          <section>
            <h2 className="mb-4 text-2xl font-semibold text-gray-800 dark:text-gray-200">
              7.1 map() with strings
            </h2>
            <MapWithStrings />
          </section>
          <section>
            <h2 className="mb-4 text-2xl font-semibold text-gray-800 dark:text-gray-200">
              7.2 map() with formatting
            </h2>
            <MapWithFormatting />
          </section>
          <section>
            <h2 className="mb-4 text-2xl font-semibold text-gray-800 dark:text-gray-200">
              7.3 forEach (not recommended)
            </h2>
            <ForEachJoin />
          </section>
          <section>
            <h2 className="mb-4 text-2xl font-semibold text-gray-800 dark:text-gray-200">
              7.4 filter + map
            </h2>
            <FilterMap />
          </section>
          <section>
            <h2 className="mb-4 text-2xl font-semibold text-gray-800 dark:text-gray-200">
              7.5 reduce for combining
            </h2>
            <ReduceCombine />
          </section>
        </div>
      </main>
    </div>
  );
}

