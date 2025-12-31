'use client';

import { useState } from 'react';

// Client Component - needs interactivity
export default function TernaryOperator() {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div className="mb-4">
        <code className="rounded bg-gray-100 dark:bg-gray-700 px-2 py-1 text-sm">
          &lt;div&gt;{'{'}isLoading ? "Loading..." : "Ready"{'}'}&lt;/div&gt;
        </code>
      </div>
      <div className="mb-4 flex items-center gap-4">
        <button
          onClick={() => setIsLoading(!isLoading)}
          className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Toggle Loading
        </button>
        <div className="rounded bg-gray-50 dark:bg-gray-900 p-4">
          <div>{isLoading ? 'Loading...' : 'Ready'}</div>
        </div>
      </div>
      <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
        <strong>AST Type:</strong> JSXExpressionContainer with ConditionalExpression
        <br />
        <strong>Description:</strong> Conditional choice of string for rendering.
      </p>
    </div>
  );
}

