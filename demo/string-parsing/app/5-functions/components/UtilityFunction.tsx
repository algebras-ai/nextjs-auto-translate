// Server Component - no interactivity needed
function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default function UtilityFunction() {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div className="mb-4">
        <code className="rounded bg-gray-100 dark:bg-gray-700 px-2 py-1 text-sm">
          import {'{'} formatDate {'}'} from './utils'; &lt;div&gt;{'{'}formatDate(date){'}'}&lt;/div&gt;
        </code>
      </div>
      <div className="rounded bg-gray-50 dark:bg-gray-900 p-4">
        <div>{formatDate(new Date())}</div>
      </div>
      <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
        <strong>AST Type:</strong> JSXExpressionContainer with CallExpression
        <br />
        <strong>Description:</strong> Imported function returning a string.
      </p>
    </div>
  );
}

