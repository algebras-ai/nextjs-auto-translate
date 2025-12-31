'use client';

import { useState } from 'react';

// Client Component - needs interactivity
export default function ClientComponent() {
  const [text, setText] = useState('Client text');

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div className="mb-4">
        <code className="rounded bg-gray-100 dark:bg-gray-700 px-2 py-1 text-sm">
          'use client'; const [text, setText] = useState("Client text");
        </code>
      </div>
      <div className="mb-4 flex items-center gap-4">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 px-3 py-2"
        />
        <div className="rounded bg-gray-50 dark:bg-gray-900 p-4">
          <div>{text}</div>
        </div>
      </div>
      <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
        <strong>AST Type:</strong> JSXExpressionContainer with Identifier
        <br />
        <strong>Description:</strong> Strings are rendered on the client.
      </p>
    </div>
  );
}

