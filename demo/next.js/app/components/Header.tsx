"use client";

import Link from "next/link";

export default function Header() {
  return (
    <header
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "20px 0",
        borderBottom: "2px solid #e5e7eb",
        marginBottom: "32px",
      }}
    >
      <nav style={{ display: "flex", gap: "24px", alignItems: "center" }}>
        <Link
          href="/"
          style={{
            textDecoration: "none",
            color: "#2563eb",
            fontWeight: "600",
            fontSize: "1.25rem",
          }}
        >
          Home
        </Link>
        <Link
          href="/about"
          style={{
            textDecoration: "none",
            color: "#2563eb",
            fontWeight: "600",
            fontSize: "1.25rem",
          }}
        >
          About
        </Link>
      </nav>
    </header>
  );
}

