// Server Component - can fetch data
async function fetchData() {
  // Simulate async data fetching
  await new Promise((resolve) => setTimeout(resolve, 100));
  return { title: 'Data from server' };
}

async function ServerComponentExample() {
  const data = await fetchData();
  return <div className="rounded bg-blue-50 dark:bg-blue-900/30 dark:text-blue-200 p-2">{data.title}</div>;
}

export default async function ServerComponent() {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div className="mb-4">
        <code className="rounded bg-gray-100 dark:bg-gray-700 px-2 py-1 text-sm">
          async function ServerComponent() {'{'}{' '}
          const data = await fetchData(); return &lt;div&gt;{'{'}data.title{'}'}&lt;/div&gt;{' '}
          {'}'}
        </code>
      </div>
      <div className="rounded bg-gray-50 dark:bg-gray-900 p-4">
        <ServerComponentExample />
      </div>
      <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
        <strong>AST Type:</strong> JSXExpressionContainer with Identifier
        <br />
        <strong>Description:</strong> Strings are rendered on the server in App Router.
      </p>
    </div>
  );
}

