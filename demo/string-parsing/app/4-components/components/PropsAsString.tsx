// Server Component - no interactivity needed
function Button({ label }: { label: string }) {
  return <button className="rounded bg-blue-600 px-4 py-2 text-white">{label}</button>;
}

function ErrorMessage({ message }: { message: string }) {
  return <div className="rounded bg-red-50 dark:bg-red-900/30 p-2 text-red-800 dark:text-red-200">{message}</div>;
}

export default function PropsAsString() {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div className="mb-4">
        <code className="rounded bg-gray-100 dark:bg-gray-700 px-2 py-1 text-sm">
          &lt;Button label="Click me" /&gt;
        </code>
      </div>
      <div className="space-y-4 rounded bg-gray-50 dark:bg-gray-900 p-4">
        <Button label="Click me" />
        <ErrorMessage message="An error occurred" />
      </div>
      <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
        <strong>AST Type:</strong> JSXAttribute with StringLiteral
        <br />
        <strong>Description:</strong> String is passed through a prop and rendered
        as visible text. Important: technical props (id, className, data-*, etc.)
        are not subject to localization.
      </p>
    </div>
  );
}

