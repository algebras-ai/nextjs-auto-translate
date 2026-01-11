'use client';
import Image from 'next/image';

// Server Component - no interactivity needed
export default function AltAttribute() {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div className="mb-4">
        <code className="rounded bg-gray-100 dark:bg-gray-700 px-2 py-1 text-sm">
          &lt;Image src=&quot;/next.svg&quot; alt=&quot;Image description&quot;
          width={100} height={100} /&gt;
        </code>
      </div>
      <div className="rounded bg-gray-50 dark:bg-gray-900 p-4">
        <div className="flex items-center gap-4">
          <Image
            src="/next.svg"
            alt="Image description"
            className="h-20 w-20 rounded border-2 border-dashed border-gray-300 dark:border-gray-600 object-cover bg-gray-100 dark:bg-gray-800"
            width={100}
            height={100}
          />
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Alt text: &quot;Image description&quot; (visible if image fails to
            load or via screen readers)
          </div>
        </div>
      </div>
      <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
        <strong>AST Type:</strong> JSXAttribute with StringLiteral or
        JSXExpressionContainer
        <br />
        <strong>Description:</strong> String in the alt attribute is displayed
        if the image fails to load and is used by screen readers. Visible to
        users.
      </p>
    </div>
  );
}
