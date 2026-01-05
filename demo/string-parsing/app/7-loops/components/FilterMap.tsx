// Server Component - no interactivity needed
export default function FilterMap() {
  const items = ['First', 'Second', 'Third', 'Fourth', 'Fifth'];

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div className="mb-4">
        <code className="rounded bg-gray-100 dark:bg-gray-700 px-2 py-1 text-sm">
          items.filter(item =&gt; item.length &gt; 5).map(...)
        </code>
      </div>
      <div className="rounded bg-gray-50 dark:bg-gray-900 p-4">
        <div className="space-y-2">
          {items
            .filter((item) => item.length > 5)
            .map((item) => (
              <div key={item} className="rounded bg-white dark:bg-gray-800 p-2 shadow dark:shadow-gray-700">
                {item}
              </div>
            ))}
        </div>
      </div>
      <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
        <strong>AST Type:</strong> JSXExpressionContainer with chain of CallExpression
        <br />
        <strong>Description:</strong> Chain of methods for filtering and rendering strings.
      </p>
    </div>
  );
}

