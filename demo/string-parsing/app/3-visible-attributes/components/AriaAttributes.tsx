// Server Component - no interactivity needed
export default function AriaAttributes() {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div className="mb-4">
        <code className="rounded bg-gray-100 dark:bg-gray-700 px-2 py-1 text-sm">
          &lt;button aria-label="Close dialog"&gt;×&lt;/button&gt;
        </code>
      </div>
      <div className="rounded bg-gray-50 dark:bg-gray-900 p-4">
        <button
          aria-label="Close dialog"
          className="rounded bg-gray-200 dark:bg-gray-700 px-4 py-2 hover:bg-gray-300 dark:hover:bg-gray-600 dark:text-gray-100"
        >
          ×
        </button>
        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          aria-label is read by screen readers
        </p>
      </div>
      <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
        <strong>AST Type:</strong> JSXAttribute with StringLiteral or JSXExpressionContainer
        <br />
        <strong>Description:</strong> aria-label, aria-describedby, aria-placeholder
        and other ARIA attributes are used by screen readers and visible to users
        with disabilities. Subject to localization.
      </p>
    </div>
  );
}

