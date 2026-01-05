// Server Component - no interactivity needed
export default function StringConcatenation() {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div className="mb-4">
        <code className="rounded bg-gray-100 dark:bg-gray-700 px-2 py-1 text-sm">
          &lt;div&gt;{'{'}&quot;Hello&quot; + &quot; &quot; + &quot;World&quot;
          {'}'}&lt;/div&gt;
        </code>
      </div>
      <div className="rounded bg-gray-50 dark:bg-gray-900 p-4">
        <div>{'Hello' + ' ' + 'World'}</div>
      </div>
      <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
        <strong>AST Type:</strong> JSXExpressionContainer with BinaryExpression
        <br />
        <strong>Description:</strong> Result of string concatenation is rendered
        as text.
      </p>
    </div>
  );
}
