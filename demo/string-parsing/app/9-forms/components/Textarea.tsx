'use client';

import { useState } from 'react';

// Client Component - needs interactivity for controlled textarea
export default function Textarea() {
  const [textAreaValue, setTextAreaValue] = useState('');

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div className="mb-4">
        <code className="rounded bg-gray-100 dark:bg-gray-700 px-2 py-1 text-sm">
          &lt;textarea placeholder="Enter your comment" /&gt;
        </code>
      </div>
      <div className="rounded bg-gray-50 dark:bg-gray-900 p-4">
        <textarea
          placeholder="Enter your comment"
          value={textAreaValue}
          onChange={(e) => setTextAreaValue(e.target.value)}
          className="w-full rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 px-3 py-2"
          rows={4}
        />
      </div>
      <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
        <strong>AST Type:</strong> JSXAttribute with StringLiteral or JSXExpressionContainer
        <br />
        <strong>Description:</strong> Placeholder and value in textarea are
        visible to users.
      </p>
    </div>
  );
}

