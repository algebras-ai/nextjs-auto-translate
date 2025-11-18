import Header from "./components/Header";
import Welcome from "./components/Welcome";
import Features from "./components/Features";

export default function Home() {
  return (
    <main className="container">
      <Header />
      <div className="content">
        <Welcome />
        <Features />
        <section className="section">
          <h2>Getting Started</h2>
          <p>
            This is a Next.js 16 example project demonstrating how to use{" "}
            <strong>algebras-auto-intl</strong> for automatic internationalization.
          </p>
          <p>
            The plugin automatically extracts text from your JSX components and
            generates translation dictionaries. Switch languages using the dropdown
            in the header!
          </p>
        </section>
      </div>
    </main>
  );
}

