// Server Component - no interactivity needed
export default function Metadata() {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div className="mb-4">
        <code className="rounded bg-gray-100 dark:bg-gray-700 px-2 py-1 text-sm">
          export const metadata: Metadata = {'{'}{' '}
          {'{'}title: "Page title", description: "Page description"{'}'}
          {'}'};
        </code>
      </div>
      <div className="rounded bg-gray-50 dark:bg-gray-900 p-4">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Check the browser tab title - it should show "8. Next.js Specifics"
        </p>
      </div>
      <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
        <strong>AST Type:</strong> ExportNamedDeclaration with ObjectExpression
        <br />
        <strong>Description:</strong> Strings in Next.js App Router metadata.
      </p>
    </div>
  );
}

