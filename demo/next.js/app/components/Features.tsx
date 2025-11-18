"use client";

export default function Features() {
  return (
    <section className="section">
      <h2>Key Features</h2>
      <p>
        Here are some of the powerful features that make{" "}
        <strong>algebras-auto-intl</strong> easy to use:
      </p>
      <div className="features-grid">
        <div className="feature-card">
          <h3>Automatic Extraction</h3>
          <p>
            The plugin automatically scans your JSX/TSX files and extracts
            translatable text content without any manual configuration.
          </p>
        </div>
        <div className="feature-card">
          <h3>Smart Caching</h3>
          <p>
            Uses lock files and content hashing to avoid unnecessary re-parsing
            and re-translation of unchanged content.
          </p>
        </div>
        <div className="feature-card">
          <h3>Zero Configuration</h3>
          <p>
            Works out of the box with Next.js 14, 15, and 16. Supports both
            Webpack and Turbopack automatically.
          </p>
        </div>
      </div>
    </section>
  );
}

