// Server Component - no interactivity needed
function Component({ children }: { children: React.ReactNode }) {
  return <div className="rounded bg-gray-100 dark:bg-gray-700 p-2">{children}</div>;
}

export default function ChildrenProp() {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div className="mb-4">
        <code className="rounded bg-gray-100 dark:bg-gray-700 px-2 py-1 text-sm">
          &lt;Component&gt;Text&lt;/Component&gt;
        </code>
      </div>
      <div className="rounded bg-gray-50 dark:bg-gray-900 p-4">
        <Component>Text</Component>
      </div>
      <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
        <strong>AST Type:</strong> JSXElement with children
        <br />
        <strong>Description:</strong> String is passed through the children prop.
      </p>
    </div>
  );
}

