// Server Component - no interactivity needed
export default function Label() {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div className="mb-4">
        <code className="rounded bg-gray-100 dark:bg-gray-700 px-2 py-1 text-sm">
          &lt;label htmlFor="input"&gt;Field label&lt;/label&gt;
        </code>
      </div>
      <div className="space-y-4 rounded bg-gray-50 dark:bg-gray-900 p-4">
        <div>
          <label htmlFor="input-example" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Field label
          </label>
          <input
            id="input-example"
            type="text"
            className="mt-1 w-full rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Email address
            <input type="email" className="mt-1 w-full rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 px-3 py-2" />
          </label>
        </div>
      </div>
      <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
        <strong>AST Type:</strong> JSXText in JSXElement
        <br />
        <strong>Description:</strong> Label text for input field is visible to
        users. The htmlFor attribute (technical) is not localized, but text
        inside &lt;label&gt; is subject to localization.
      </p>
    </div>
  );
}

