// Server Component - no interactivity needed
export default function GenerateMetadata() {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div className="mb-4">
        <code className="rounded bg-gray-100 dark:bg-gray-700 px-2 py-1 text-sm">
          export async function generateMetadata(): Promise&lt;Metadata&gt; {'{'}{' '}
          return {'{'}{' '}title: "Dynamic title", description: "Dynamic description"{' '}
          {'}'}; {'}'}
        </code>
      </div>
      <div className="rounded bg-gray-50 dark:bg-gray-900 p-4">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Dynamic metadata via function (can be async and fetch data)
        </p>
      </div>
      <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
        <strong>AST Type:</strong> FunctionDeclaration with ReturnStatement
        <br />
        <strong>Description:</strong> Dynamic metadata via function.
      </p>
    </div>
  );
}

