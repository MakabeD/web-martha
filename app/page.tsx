import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-6 sm:px-6 sm:py-10">
      <section className="w-full max-w-3xl rounded-[1.75rem] border border-[color:var(--line)] bg-[color:var(--panel)] px-5 py-10 text-center shadow-[var(--shadow)] backdrop-blur sm:px-10 sm:py-14 lg:rounded-[2rem] lg:px-12">
        <p className="text-sm font-semibold uppercase tracking-[0.38em] text-[color:var(--accent)]">
          Eliza
        </p>
        <h1 className="mt-5 text-4xl font-semibold tracking-[-0.05em] text-[color:var(--primary)] sm:text-6xl lg:text-7xl">
          Catalogo de eliza
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-[color:var(--ink)]/70 sm:text-base lg:text-lg">
          Una seleccion pensada para explorar prendas, categorias y detalles
          con una experiencia simple y elegante.
        </p>
        <Link
          href="/catalogo"
          className="mt-8 inline-flex rounded-full bg-[color:var(--primary)] px-7 py-3 text-sm font-semibold text-[color:var(--surface)] shadow-[0_16px_34px_rgba(111,3,3,0.22)] transition duration-300 hover:-translate-y-0.5 hover:bg-[color:var(--accent)] sm:mt-9 sm:px-8 sm:text-base"
        >
          Ver catalogo
        </Link>
      </section>
    </main>
  );
}
