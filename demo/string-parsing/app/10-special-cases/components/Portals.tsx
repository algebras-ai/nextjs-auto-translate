'use client';

import { createPortal } from 'react-dom';
import { useEffect, useState } from 'react';

// Client Component - needs browser APIs (createPortal, document)
export default function Portals() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div className="mb-4">
        <code className="rounded bg-gray-100 dark:bg-gray-700 px-2 py-1 text-sm">
          createPortal(&lt;div&gt;Content in portal&lt;/div&gt;, document.body)
        </code>
      </div>
      <div className="rounded bg-gray-50 dark:bg-gray-900 p-4">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Portal content is rendered to document.body (check browser inspector)
        </p>
        {typeof window !== 'undefined' &&
          createPortal(
            <div className="fixed bottom-4 right-4 rounded bg-blue-600 px-4 py-2 text-white shadow-lg">
              Content in portal
            </div>,
            document.body
          )}
      </div>
      <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
        <strong>AST Type:</strong> JSXExpressionContainer with CallExpression (createPortal)
        <br />
        <strong>Description:</strong> Strings are rendered through a portal to
        another DOM node.
      </p>
    </div>
  );
}

