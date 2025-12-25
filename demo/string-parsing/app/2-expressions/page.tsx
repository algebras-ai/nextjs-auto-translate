import ConditionalExpression from './components/ConditionalExpression';
import FunctionCall from './components/FunctionCall';
import LogicalAnd from './components/LogicalAnd';
import StringConcatenation from './components/StringConcatenation';
import StringLiteral from './components/StringLiteral';
import StringMethod from './components/StringMethod';
import TemplateLiteral from './components/TemplateLiteral';
import VariableString from './components/VariableString';

export default function ExpressionsPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="mb-8 text-3xl font-bold text-gray-900 dark:text-gray-100">
          2. Expressions - JSXExpressionContainer
        </h1>
        <div className="space-y-8">
          <section>
            <h2 className="mb-4 text-2xl font-semibold text-gray-800 dark:text-gray-200">
              2.1 String literal in expression
            </h2>
            <StringLiteral />
          </section>
          <section>
            <h2 className="mb-4 text-2xl font-semibold text-gray-800 dark:text-gray-200">
              2.2 Variable with string
            </h2>
            <VariableString />
          </section>
          <section>
            <h2 className="mb-4 text-2xl font-semibold text-gray-800 dark:text-gray-200">
              2.3 String concatenation
            </h2>
            <StringConcatenation />
          </section>
          <section>
            <h2 className="mb-4 text-2xl font-semibold text-gray-800 dark:text-gray-200">
              2.4 Template literals
            </h2>
            <TemplateLiteral />
          </section>
          <section>
            <h2 className="mb-4 text-2xl font-semibold text-gray-800 dark:text-gray-200">
              2.5 Conditional expression (ternary)
            </h2>
            <ConditionalExpression />
          </section>
          <section>
            <h2 className="mb-4 text-2xl font-semibold text-gray-800 dark:text-gray-200">
              2.6 Logical AND (&&)
            </h2>
            <LogicalAnd />
          </section>
          <section>
            <h2 className="mb-4 text-2xl font-semibold text-gray-800 dark:text-gray-200">
              2.7 Function call returning string
            </h2>
            <FunctionCall />
          </section>
          <section>
            <h2 className="mb-4 text-2xl font-semibold text-gray-800 dark:text-gray-200">
              2.8 String method
            </h2>
            <StringMethod />
          </section>
        </div>
      </main>
    </div>
  );
}
