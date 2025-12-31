// Server Component - no interactivity needed
function Bold({ children }: { children: string }) {
  return <strong className="font-bold">{children}</strong>;
}

export default function WrapperComponent() {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div className="mb-4">
        <code className="rounded bg-gray-100 dark:bg-gray-700 px-2 py-1 text-sm">
          &lt;Bold&gt;Bold text&lt;/Bold&gt;
        </code>
      </div>
      <div className="rounded bg-gray-50 dark:bg-gray-900 p-4">
        <Bold>Bold text</Bold>
      </div>
      <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
        <strong>AST Type:</strong> JSXElement with nested JSXText
        <br />
        <strong>Description:</strong> Component wraps a string in additional tags.
      </p>
    </div>
  );
}

