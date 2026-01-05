// Server Component - function call doesn't need client interactivity
function getGreeting() {
  return 'Hello from function';
}

export default function FunctionCall() {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div className="mb-4">
        <code className="rounded bg-gray-100 dark:bg-gray-700 px-2 py-1 text-sm">
          &lt;div&gt;{'{'}getGreeting(){'}'}&lt;/div&gt;
        </code>
      </div>
      <div className="rounded bg-gray-50 dark:bg-gray-900 p-4">
        <div>{getGreeting()}</div>
      </div>
      <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
        <strong>AST Type:</strong> JSXExpressionContainer with CallExpression
        <br />
        <strong>Description:</strong> Function is called and returns a string
        that is rendered.
      </p>
    </div>
  );
}

