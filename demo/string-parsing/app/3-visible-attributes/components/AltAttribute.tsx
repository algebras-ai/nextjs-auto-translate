// Server Component - no interactivity needed
export default function AltAttribute() {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div className="mb-4">
        <code className="rounded bg-gray-100 dark:bg-gray-700 px-2 py-1 text-sm">
          &lt;img src="/image.jpg" alt="Image description" /&gt;
        </code>
      </div>
      <div className="rounded bg-gray-50 dark:bg-gray-900 p-4">
        <div className="flex items-center gap-4">
          <div className="flex h-20 w-20 items-center justify-center rounded border-2 border-dashed border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800">
            <span className="text-xs text-gray-500 dark:text-gray-400">Image</span>
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Alt text: "Image description" (visible if image fails to load or via screen readers)
          </div>
        </div>
      </div>
      <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
        <strong>AST Type:</strong> JSXAttribute with StringLiteral or JSXExpressionContainer
        <br />
        <strong>Description:</strong> String in the alt attribute is displayed if
        the image fails to load and is used by screen readers. Visible to users.
      </p>
    </div>
  );
}

