'use client';

export default function Welcome() {
  return (
    <section className="section">
      <h1>Welcome to Next.js 15 with Auto Intl</h1>
      <p>
        This example demonstrates automatic internationalization with{' '}
        <strong>algebras-auto-intl</strong>.
      </p>
      <p>
        The plugin automatically extracts text from your JSX components and
        generates translation dictionaries. Switch languages using the dropdown
        in the header to see translations in action!
      </p>
    </section>
  );
}
