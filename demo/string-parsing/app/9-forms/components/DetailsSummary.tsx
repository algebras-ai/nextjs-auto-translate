// Server Component - no interactivity needed (browser handles details/summary)
export default function DetailsSummary() {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div className="mb-4">
        <code className="rounded bg-gray-100 dark:bg-gray-700 px-2 py-1 text-sm">
          &lt;details&gt; &lt;summary&gt;Click to expand&lt;/summary&gt; ... &lt;/details&gt;
        </code>
      </div>
      <div className="rounded bg-gray-50 dark:bg-gray-900 p-4">
        <details className="rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100">
          <summary className="cursor-pointer px-4 py-2 font-medium hover:bg-gray-100 dark:hover:bg-gray-600">
            Click to expand
          </summary>
          <div className="border-t border-gray-300 dark:border-gray-600 p-4">
            <p>Hidden content</p>
          </div>
        </details>
      </div>
      <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
        <strong>AST Type:</strong> JSXText in JSXElement (summary)
        <br />
        <strong>Description:</strong> Text in &lt;summary&gt; is visible to users
        as a clickable heading for an expandable block.
      </p>
    </div>
  );
}

