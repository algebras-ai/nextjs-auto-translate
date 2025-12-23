// Server Component - no interactivity needed
export default function MapWithFormatting() {
  const numbers = [1, 2, 3];

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div className="mb-4">
        <code className="rounded bg-gray-100 dark:bg-gray-700 px-2 py-1 text-sm">
          numbers.map(n =&gt; `Number: ${'{'}n{'}'}`)
        </code>
      </div>
      <div className="rounded bg-gray-50 dark:bg-gray-900 p-4">
        <div className="space-y-2">
          {numbers.map((n) => (
            <div key={n} className="rounded bg-white dark:bg-gray-800 p-2 shadow dark:shadow-gray-700">
              {`Number: ${n}`}
            </div>
          ))}
        </div>
      </div>
      <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
        <strong>AST Type:</strong> JSXExpressionContainer with CallExpression
        <br />
        <strong>Description:</strong> Strings are formed dynamically in map.
      </p>
    </div>
  );
}

