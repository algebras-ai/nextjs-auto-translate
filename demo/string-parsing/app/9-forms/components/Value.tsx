// Server Component - defaultValue doesn't need interactivity
export default function Value() {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div className="mb-4">
        <code className="rounded bg-gray-100 dark:bg-gray-700 px-2 py-1 text-sm">
          &lt;input defaultValue="Default value" /&gt;
        </code>
      </div>
      <div className="rounded bg-gray-50 dark:bg-gray-900 p-4">
        <input
          type="text"
          defaultValue="Default value"
          className="w-full rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 px-3 py-2"
        />
      </div>
      <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
        <strong>AST Type:</strong> JSXAttribute with StringLiteral
        <br />
        <strong>Description:</strong> Input field default value is visible to
        users in the field. Used for pre-filled uncontrolled fields.
      </p>
    </div>
  );
}
