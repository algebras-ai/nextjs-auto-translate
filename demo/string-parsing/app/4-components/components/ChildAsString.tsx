// Server Component - no interactivity needed
function Component({ children }: { children: React.ReactNode }) {
  return <div className="rounded bg-blue-50 dark:bg-blue-900/30 dark:text-blue-200 p-2">{children}</div>;
}

export default function ChildAsString() {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div className="mb-4">
        <code className="rounded bg-gray-100 dark:bg-gray-700 px-2 py-1 text-sm">
          &lt;Component&gt;Child element text&lt;/Component&gt;
        </code>
      </div>
      <div className="rounded bg-gray-50 dark:bg-gray-900 p-4">
        <Component>Child element text</Component>
      </div>
      <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
        <strong>AST Type:</strong> JSXElement with JSXText in children
        <br />
        <strong>Description:</strong> String is passed as children of the component.
      </p>
    </div>
  );
}

