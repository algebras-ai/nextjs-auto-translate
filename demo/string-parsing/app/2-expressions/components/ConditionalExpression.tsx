'use client';

import { useState } from 'react';

// Client Component - needs interactivity for toggle
export default function ConditionalExpression() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div className="mb-4">
        <code className="rounded bg-gray-100 dark:bg-gray-700 px-2 py-1 text-sm">
          &lt;div&gt;{'{'}isLoggedIn ? "Logout" : "Login"{'}'}&lt;/div&gt;
        </code>
      </div>
      <div className="mb-4 flex items-center gap-4">
        <button
          onClick={() => setIsLoggedIn(!isLoggedIn)}
          className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Toggle Login State
        </button>
        <div className="rounded bg-gray-50 dark:bg-gray-900 p-4">
          <div>{isLoggedIn ? 'Logout' : 'Login'}</div>
        </div>
      </div>
      <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
        <strong>AST Type:</strong> JSXExpressionContainer with ConditionalExpression
        <br />
        <strong>Description:</strong> Conditional expression returns a string
        that is rendered.
      </p>
    </div>
  );
}

