// Server Component - no interactivity needed
function TextComponent({ text }: { text: string }) {
  return <span className="font-semibold">{text}</span>;
}

export default function RenderingViaComponent() {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div className="mb-4">
        <code className="rounded bg-gray-100 dark:bg-gray-700 px-2 py-1 text-sm">
          &lt;TextComponent text="Text" /&gt;
        </code>
      </div>
      <div className="rounded bg-gray-50 dark:bg-gray-900 p-4">
        <TextComponent text="Text" />
      </div>
      <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
        <strong>AST Type:</strong> JSXElement (component)
        <br />
        <strong>Description:</strong> Component receives a string and renders it.
      </p>
    </div>
  );
}

