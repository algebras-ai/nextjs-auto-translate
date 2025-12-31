'use client';

import { useState } from 'react';

// Client Component - needs interactivity for controlled input
export default function Value() {
  const [inputValue, setInputValue] = useState('Default value');

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div className="mb-4">
        <code className="rounded bg-gray-100 dark:bg-gray-700 px-2 py-1 text-sm">
          &lt;input value={'{'}inputValue{'}'} /&gt;
        </code>
      </div>
      <div className="rounded bg-gray-50 dark:bg-gray-900 p-4">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="w-full rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 px-3 py-2"
        />
      </div>
      <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
        <strong>AST Type:</strong> JSXAttribute with JSXExpressionContainer or StringLiteral
        <br />
        <strong>Description:</strong> Input field value is visible to users in
        the field. Used for pre-filled fields or controlled components.
      </p>
    </div>
  );
}

