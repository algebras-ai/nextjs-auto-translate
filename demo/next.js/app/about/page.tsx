import Header from "../components/Header";

export default function About() {
  return (
    <main className="container">
      <Header />
      <div className="content">
        <section className="section">
          <h1>About This Project</h1>
          <p>
            This example demonstrates how <strong>algebras-auto-intl</strong> works
            with Next.js 15.
          </p>
          <p>
            The plugin automatically:
          </p>
          <ul>
            <li>Extracts translatable strings from your JSX/TSX files</li>
            <li>Generates translation dictionaries during build</li>
            <li>Wraps your layout with IntlWrapper automatically</li>
            <li>Injects Translated components to replace JSX text</li>
          </ul>
          <p>
            All the text on this page will be automatically translated when you
            switch languages using the locale switcher in the header.
          </p>
        </section>
      </div>
    </main>
  );
}

