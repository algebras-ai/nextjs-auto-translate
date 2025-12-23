import { Suspense } from 'react';

// Server Component - Suspense works on server
async function AsyncComponent() {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return <div className="rounded bg-green-50 dark:bg-green-900/30 p-4 dark:text-green-200">Async content loaded</div>;
}

export default function SuspenseFallback() {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div className="mb-4">
        <code className="rounded bg-gray-100 dark:bg-gray-700 px-2 py-1 text-sm">
          &lt;Suspense fallback={'{'}&lt;div&gt;Loading...&lt;/div&gt;{'}'}&gt;
        </code>
      </div>
      <div className="rounded bg-gray-50 dark:bg-gray-900 p-4">
        <Suspense fallback={<div className="rounded bg-yellow-50 dark:bg-yellow-900/30 p-4 dark:text-yellow-200">Loading...</div>}>
          <AsyncComponent />
        </Suspense>
      </div>
      <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
        <strong>AST Type:</strong> JSXElement (Suspense) with JSXAttribute (fallback)
        <br />
        <strong>Description:</strong> String in Suspense fallback component.
      </p>
    </div>
  );
}

