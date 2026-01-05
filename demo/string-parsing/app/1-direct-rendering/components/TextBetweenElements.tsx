// Server Component - no interactivity needed
export default function TextBetweenElements() {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div className="mb-4">
        <code className="rounded bg-gray-100 dark:bg-gray-700 px-2 py-1 text-sm">
          &lt;div&gt;Text &lt;span&gt;between&lt;/span&gt; elements&lt;/div&gt;
        </code>
      </div>
      <div className="rounded bg-gray-50 dark:bg-gray-900 p-4">
        <div>
          Text <span className="font-semibold">between</span> elements
        </div>
      </div>
      <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
        <strong>AST Type:</strong> Multiple JSXText nodes
        <br />
        <strong>Description:</strong> Each text fragment between elements
        becomes a separate JSXText node.
      </p>
    </div>
  );
}

