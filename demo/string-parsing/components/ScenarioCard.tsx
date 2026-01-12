import Link from 'next/link';
import { ReactNode } from 'react';

interface ScenarioCardProps {
  href: string;
  children: ReactNode;
}

export default function ScenarioCard({ href, children }: ScenarioCardProps) {
  return (
    <Link
      href={href}
      className="group rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-all hover:border-blue-500 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:hover:border-blue-400"
    >
      {children}
    </Link>
  );
}
