import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <section className="flex flex-col items-center text-center">
        <h1 className="text-5xl font-semibold tracking-[-0.04em] text-[color:var(--primary)] sm:text-6xl">
          Catalogo de eliza
        </h1>
        <Link
          href="/catalogo"
          className="mt-8 rounded-full bg-[color:var(--primary)] px-8 py-3 text-base font-semibold text-[color:var(--surface)] transition hover:bg-[color:var(--ink)]"
        >
          Ver catalogo
        </Link>
      </section>
    </main>
  );
}
