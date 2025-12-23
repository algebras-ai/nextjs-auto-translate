'use client';

import { Component, ReactNode } from 'react';

// Client Component - Error Boundary needs class component
interface ErrorBoundaryProps {
  children: ReactNode;
  fallback: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundaryClass extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

function ComponentThatThrows() {
  throw new Error('Test error');
  return <div>This won't render</div>;
}

export default function ErrorBoundary() {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
      <div className="mb-4">
        <code className="rounded bg-gray-100 dark:bg-gray-700 px-2 py-1 text-sm">
          &lt;ErrorBoundary fallback={'{'}&lt;div&gt;An error occurred&lt;/div&gt;{'}'}&gt;
        </code>
      </div>
      <div className="rounded bg-gray-50 dark:bg-gray-900 p-4">
          <ErrorBoundaryClass fallback={<div className="rounded bg-red-50 dark:bg-red-900/30 p-4 text-red-800 dark:text-red-200">An error occurred</div>}>
          <ComponentThatThrows />
        </ErrorBoundaryClass>
      </div>
      <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
        <strong>AST Type:</strong> JSXElement with JSXAttribute (fallback)
        <br />
        <strong>Description:</strong> String in Error Boundary fallback component.
      </p>
    </div>
  );
}

