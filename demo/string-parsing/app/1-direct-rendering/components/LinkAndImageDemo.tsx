import Image from 'next/image';
import Link from 'next/link';

// Server Component - test case for PascalCase components (Link, Image) + elementProps
export default function LinkAndImageDemo() {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div className="mb-4">
        <code className="rounded bg-gray-100 dark:bg-gray-700 px-2 py-1 text-sm">
          &lt;Link href=&quot;/about&quot;&gt;About&lt;/Link&gt; and &lt;Image
          alt=&quot;...&quot; /&gt;
        </code>
      </div>
      <div className="space-y-4 rounded bg-gray-50 dark:bg-gray-900 p-4">
        <p>
          Visit the <Link href="/about">About</Link> page for more info.
        </p>
        <p className="flex items-center gap-2">
          Icon:{' '}
          <Image src="/globe.svg" alt="Globe icon" width={24} height={24} />
        </p>
      </div>
      <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
        <strong>Test:</strong> PascalCase components – Link and Image should
        render as React components (not unknown tags) with props preserved.
      </p>
    </div>
  );
}
