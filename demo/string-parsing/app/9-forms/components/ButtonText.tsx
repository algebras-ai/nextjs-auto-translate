// Server Component - no interactivity needed
export default function ButtonText() {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div className="mb-4">
        <code className="rounded bg-gray-100 dark:bg-gray-700 px-2 py-1 text-sm">
          &lt;button&gt;Submit&lt;/button&gt;
        </code>
      </div>
      <div className="space-y-4 rounded bg-gray-50 dark:bg-gray-900 p-4">
        <button className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
          Submit
        </button>
        <input
          type="submit"
          value="Submit form"
          className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700"
        />
      </div>
      <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
        <strong>AST Type:</strong> JSXText in JSXElement or JSXAttribute (value for input
        type="submit")
        <br />
        <strong>Description:</strong> Button text is visible to users. For
        &lt;input type="submit"&gt; text is set via the value attribute.
      </p>
    </div>
  );
}

