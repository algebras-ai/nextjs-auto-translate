import TernaryOperator from './components/TernaryOperator';
import LogicalAnd from './components/LogicalAnd';
import LogicalOr from './components/LogicalOr';
import IfElseFunction from './components/IfElseFunction';
import SwitchCaseFunction from './components/SwitchCaseFunction';

export default function ConditionalLogicPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="mb-8 text-3xl font-bold text-gray-900 dark:text-gray-100">
          6. Conditional Logic - ternary operators
        </h1>
        <div className="space-y-8">
          <section>
            <h2 className="mb-4 text-2xl font-semibold text-gray-800 dark:text-gray-200">
              6.1 Ternary operator
            </h2>
            <TernaryOperator />
          </section>
          <section>
            <h2 className="mb-4 text-2xl font-semibold text-gray-800 dark:text-gray-200">
              6.2 Logical AND
            </h2>
            <LogicalAnd />
          </section>
          <section>
            <h2 className="mb-4 text-2xl font-semibold text-gray-800 dark:text-gray-200">
              6.3 Logical OR
            </h2>
            <LogicalOr />
          </section>
          <section>
            <h2 className="mb-4 text-2xl font-semibold text-gray-800 dark:text-gray-200">
              6.4 If-else via function
            </h2>
            <IfElseFunction />
          </section>
          <section>
            <h2 className="mb-4 text-2xl font-semibold text-gray-800 dark:text-gray-200">
              6.5 Switch-case via function
            </h2>
            <SwitchCaseFunction />
          </section>
        </div>
      </main>
    </div>
  );
}

