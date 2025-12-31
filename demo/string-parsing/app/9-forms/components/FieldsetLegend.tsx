// Server Component - no interactivity needed
export default function FieldsetLegend() {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div className="mb-4">
        <code className="rounded bg-gray-100 dark:bg-gray-700 px-2 py-1 text-sm">
          &lt;fieldset&gt; &lt;legend&gt;Field group&lt;/legend&gt; ... &lt;/fieldset&gt;
        </code>
      </div>
      <div className="rounded bg-gray-50 dark:bg-gray-900 p-4">
        <fieldset className="rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-800 p-4">
          <legend className="px-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            Field group
          </legend>
          <input
            type="text"
            placeholder="Input field"
            className="mt-2 w-full rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 px-3 py-2"
          />
        </fieldset>
      </div>
      <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
        <strong>AST Type:</strong> JSXText in JSXElement (legend)
        <br />
        <strong>Description:</strong> Text in &lt;legend&gt; is visible to users
        as a heading for a group of fields.
      </p>
    </div>
  );
}

