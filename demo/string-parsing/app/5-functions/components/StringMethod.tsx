// Server Component - no interactivity needed
export default function StringMethod() {
  const text = '  Hello World  ';
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div className="mb-4 space-y-2">
        <div>
          <code className="rounded bg-gray-100 dark:bg-gray-700 px-2 py-1 text-sm">
            text.trim()
          </code>
        </div>
        <div>
          <code className="rounded bg-gray-100 dark:bg-gray-700 px-2 py-1 text-sm">
            text.substring(0, 10)
          </code>
        </div>
      </div>
      <div className="space-y-2 rounded bg-gray-50 dark:bg-gray-900 p-4">
        <div>{text.trim()}</div>
        <div>{text.substring(0, 10)}</div>
      </div>
      <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
        <strong>AST Type:</strong> JSXExpressionContainer with CallExpression
        <br />
        <strong>Description:</strong> Built-in JavaScript string methods.
      </p>
    </div>
  );
}

