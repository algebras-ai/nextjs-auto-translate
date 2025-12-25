// Server Component - no interactivity needed
export default function SelectOptions() {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div className="mb-4">
        <code className="rounded bg-gray-100 dark:bg-gray-700 px-2 py-1 text-sm">
          &lt;option value="1"&gt;First option&lt;/option&gt;
        </code>
      </div>
      <div className="rounded bg-gray-50 dark:bg-gray-900 p-4">
        <select className="w-full rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 px-3 py-2">
          <option value="1">First option</option>
          <option value="2">Second option</option>
        </select>
      </div>
      <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
        <strong>AST Type:</strong> JSXText in JSXElement (option)
        <br />
        <strong>Description:</strong> Option text in select is visible to users
        when opening the list. The value attribute (technical) is not localized.
      </p>
    </div>
  );
}

