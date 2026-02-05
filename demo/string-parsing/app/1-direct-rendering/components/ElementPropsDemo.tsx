// Server Component - test case for elementProps (preserved attributes on <element:span>)
export default function ElementPropsDemo() {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div className="mb-4">
        <code className="rounded bg-gray-100 dark:bg-gray-700 px-2 py-1 text-sm">
          &lt;p&gt;... &lt;span
          style=&#123;&#123;color:&quot;red&quot;&#125;&#125;
          className=&quot;red-text&quot;
          data-name=&quot;red-span&quot;&gt;span&lt;/span&gt;&lt;/p&gt;
        </code>
      </div>
      <div className="rounded bg-gray-50 dark:bg-gray-900 p-4">
        <p>
          Paragraph with styled{' '}
          <span
            style={{ color: 'red' }}
            className="red-text font-semibold"
            data-name="red-span"
          >
            span
          </span>
        </p>
      </div>
      <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
        <strong>Test:</strong> elementProps – after translate the span should
        keep red color, .red-text class and data-name attribute.
      </p>
    </div>
  );
}
