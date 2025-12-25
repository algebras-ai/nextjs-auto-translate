// Server Component - no interactivity needed
export default function TextWithSpaces() {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div className="mb-4">
        <code className="rounded bg-gray-100 dark:bg-gray-700 px-2 py-1 text-sm">
          &lt;div&gt;Text with spaces and line breaks&lt;/div&gt;
        </code>
      </div>
      <div className="rounded bg-gray-50 dark:bg-gray-900 p-4">
        <div>
          Text with spaces and line breaks
        </div>
      </div>
      <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
        <strong>AST Type:</strong> JSXText
        <br />
        <strong>Description:</strong> Spaces and line breaks are preserved in
        JSXText, but React normalizes them during rendering.
      </p>
    </div>
  );
}

