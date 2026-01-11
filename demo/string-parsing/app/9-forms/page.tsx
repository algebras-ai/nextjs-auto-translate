import Placeholder from './components/Placeholder';
import Value from './components/Value';
import Label from './components/Label';
import ButtonText from './components/ButtonText';
import Textarea from './components/Textarea';
import SelectOptions from './components/SelectOptions';
import FieldsetLegend from './components/FieldsetLegend';
import DetailsSummary from './components/DetailsSummary';

export default function FormsPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="mb-8 text-3xl font-bold text-gray-900 dark:text-gray-100">
          9. Forms - placeholder, value, label, button, option
        </h1>
        <div className="space-y-8">
          <section>
            <h2 className="mb-4 text-2xl font-semibold text-gray-800 dark:text-gray-200">
              9.1 Placeholder
            </h2>
            <Placeholder />
          </section>
          <section>
            <h2 className="mb-4 text-2xl font-semibold text-gray-800 dark:text-gray-200">
              9.2 Value
            </h2>
            <Value />
          </section>
          <section>
            <h2 className="mb-4 text-2xl font-semibold text-gray-800 dark:text-gray-200">
              9.3 Label
            </h2>
            <Label />
          </section>
          <section>
            <h2 className="mb-4 text-2xl font-semibold text-gray-800 dark:text-gray-200">
              9.4 Button text
            </h2>
            <ButtonText />
          </section>
          <section>
            <h2 className="mb-4 text-2xl font-semibold text-gray-800 dark:text-gray-200">
              9.5 Textarea
            </h2>
            <Textarea />
          </section>
          <section>
            <h2 className="mb-4 text-2xl font-semibold text-gray-800 dark:text-gray-200">
              9.6 Select options
            </h2>
            <SelectOptions />
          </section>
          <section>
            <h2 className="mb-4 text-2xl font-semibold text-gray-800 dark:text-gray-200">
              9.7 Fieldset and Legend
            </h2>
            <FieldsetLegend />
          </section>
          <section>
            <h2 className="mb-4 text-2xl font-semibold text-gray-800 dark:text-gray-200">
              9.8 Details and Summary
            </h2>
            <DetailsSummary />
          </section>
        </div>
      </main>
    </div>
  );
}
