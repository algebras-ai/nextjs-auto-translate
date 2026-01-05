'use client';

import { useState } from 'react';

// Client Component - needs interactivity
function getStatusText(status: string) {
  switch (status) {
    case 'pending':
      return 'Pending';
    case 'success':
      return 'Success';
    default:
      return 'Unknown';
  }
}

export default function SwitchCaseFunction() {
  const [status, setStatus] = useState('pending');

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div className="mb-4">
        <code className="rounded bg-gray-100 dark:bg-gray-700 px-2 py-1 text-sm">
          &lt;div&gt;{'{'}getStatusText(status){'}'}&lt;/div&gt;
        </code>
      </div>
      <div className="mb-4 flex items-center gap-4">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 px-3 py-2"
        >
          <option value="pending">Pending</option>
          <option value="success">Success</option>
          <option value="unknown">Unknown</option>
        </select>
        <div className="rounded bg-gray-50 dark:bg-gray-900 p-4">
          <div>{getStatusText(status)}</div>
        </div>
      </div>
      <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
        <strong>AST Type:</strong> JSXExpressionContainer with CallExpression
        <br />
        <strong>Description:</strong> Switch-case logic in a function.
      </p>
    </div>
  );
}

