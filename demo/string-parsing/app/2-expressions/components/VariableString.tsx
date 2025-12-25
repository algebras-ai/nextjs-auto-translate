// Server Component - no interactivity needed
export default function VariableString() {
  const text = 'Text from variable';
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div className="mb-4">
        <code className="rounded bg-gray-100 dark:bg-gray-700 px-2 py-1 text-sm">
          const text = "Text from variable"; &lt;div&gt;{'{'}text{'}'}&lt;/div&gt;
        </code>
      </div>
      <div className="rounded bg-gray-50 dark:bg-gray-900 p-4">
        <div>{text}</div>
      </div>
      <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
        <strong>AST Type:</strong> JSXExpressionContainer with Identifier
        <br />
        <strong>Description:</strong> Variable containing a string is rendered
        as text.
      </p>
    </div>
  );
}

