import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-10">
      <section className="w-full max-w-3xl rounded-[2rem] border border-[color:var(--line)] bg-[color:var(--panel)] px-8 py-14 text-center shadow-[var(--shadow)] backdrop-blur sm:px-12 sm:py-18">
        <p className="text-sm font-semibold uppercase tracking-[0.38em] text-[color:var(--accent)]">
          Eliza
        </p>
        <h1 className="mt-5 text-5xl font-semibold tracking-[-0.05em] text-[color:var(--primary)] sm:text-7xl">
          Catalogo de eliza
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-[color:var(--ink)]/70 sm:text-lg">
          Una seleccion pensada para explorar prendas, categorias y detalles
          con una experiencia simple y elegante.
        </p>
        <Link
          href="/catalogo"
          className="mt-9 inline-flex rounded-full bg-[color:var(--primary)] px-8 py-3 text-base font-semibold text-[color:var(--surface)] shadow-[0_16px_34px_rgba(111,3,3,0.22)] transition duration-300 hover:-translate-y-0.5 hover:bg-[color:var(--accent)]"
        >
          Ver catalogo
        </Link>
      </section>
    </main>
  );
}
